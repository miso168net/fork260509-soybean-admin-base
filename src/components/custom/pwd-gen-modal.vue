<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 產密浮層共用元件（新增檔；基線 example
// 無此路徑、零原行；憲法 §III.2 (v) 列明文「components/custom/pwd-gen-modal.vue 為 rev5 新增型新檔、不入名冊」）。
// 對外契約＝props `policy`（getPasswordPolicy 七欄投影，掛載端讀好傳入——★本元件零網路請求）
// ＋`userName`（forbidUsername 的比對源）；「產生」＝本地 CSPRNG 構造性滿足政策全部規則、
// 「複製」寫剪貼簿、「帶入」emit `apply(password)` 交由掛載端填欄。
// ★**一律 crypto.getRandomValues、絕不用 Math.random**：後者是可預測的 PRNG，拿它產出的密碼在
// 已知種子下可重建——產密工具用它等於發一把假鎖。
// ★密碼值只存在於本元件的 ref 與 emit 參數：不寫 log、不寫 console、不落任何持久儲存。
// rev4: 承 rev4:components/custom/pwd-gen-modal.vue 之對外形（props／apply emit／構造性生成＋洗牌），
// 內容依 rev5 拍板重寫三處——①政策入參換具名七欄投影（rev4 為 KV 清單、需字串鍵查表）
// ②長度改為**可調欄**（rev4 固定取偏 16 的安全值、使用者無從調整；本刀 i18n 契約列有 `pwdGen.length` 鍵）
// ③i18n 鍵歸位 `page.manage.user.pwdGen.*`（rev4 為 top-level `pwdGen.*`＝rev5 命名空間紀律差異）。
import { computed, ref, watch } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdGenModal'
});

interface Props {
  /** 密碼政策七欄投影；★`null`＝掛載端沒讀到（讀失敗或尚未載入）⇒ 以下方預設界生成、後端仍是唯一裁判 */
  policy: Api.UserCenter.PasswordPolicyView | null;
  /** 標的帳號名（`forbidUsername` 比對源；空字串＝略過比對） */
  userName?: string;
}

const props = withDefaults(defineProps<Props>(), { userName: '' });

const emit = defineEmits<{ apply: [password: string] }>();

const visible = defineModel<boolean>('visible', { default: false });

// 政策取不到時的長度預設界（★只是「產多長」的預設值，不是規則主張：真正的長度規則在後端）
const FALLBACK_MIN = 8;
const FALLBACK_MAX = 64;
/** 預設產出長度：明顯高於常見下限、又不至於難以人工抄寫 */
const PREFERRED_LENGTH = 16;

// 字元類別集：與後端政策正則同界（upper `[A-Z]`／lower `[a-z]`／digit `[0-9]`／special `[^A-Za-z0-9]`）；
// special 取常見可列印安全子集（仍滿足 `[^A-Za-z0-9]`，避開引號／反斜線／空白等在轉貼途中易出事的字元）。
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGIT = '0123456789';
const SPECIAL = '!@#$%^&*()-_=+[]{}.,?~';

/** 當前產生值（唯讀展示；關閉浮層即清空、不跨開關留存） */
const generated = ref('');

/** 產出長度（可調；界＝政策長度上下限）。★型含 `null`＝NInputNumber 允許清空欄位，清空時以預設值續行 */
const length = ref<number | null>(PREFERRED_LENGTH);

/** 長度可調範圍（政策界；上限低於下限的畸形政策以下限為準——寧可產得長一點也不要產不出來） */
const lengthRange = computed(() => {
  const min = props.policy && props.policy.minLength > 0 ? props.policy.minLength : FALLBACK_MIN;
  const max = props.policy && props.policy.maxLength > 0 ? props.policy.maxLength : FALLBACK_MAX;

  return { min, max: Math.max(max, min) };
});

/** 政策要求必含的字元類別集（★空集＝四類皆非必含，全字集照樣涵蓋四類、不違任何規則） */
const requiredSets = computed(() => {
  const sets: string[] = [];

  if (props.policy?.requireUppercase) {
    sets.push(UPPER);
  }

  if (props.policy?.requireLowercase) {
    sets.push(LOWER);
  }

  if (props.policy?.requireDigit) {
    sets.push(DIGIT);
  }

  if (props.policy?.requireSpecial) {
    sets.push(SPECIAL);
  }

  return sets;
});

/**
 * CSPRNG 均勻整數 `[0, bound)`
 *
 * ★以 rejection sampling 去掉模偏差：直接 `value % bound` 會讓前幾個索引出現機率偏高，
 * 對密碼而言就是可觀察的分佈偏斜。
 */
function randInt(bound: number) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / bound) * bound;
  let value = 0;

  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);

  return value % bound;
}

/** Fisher–Yates 洗牌（索引取自 CSPRNG）：不洗的話「必含類別」會固定落在字串前段、形成可猜的樣式 */
function shuffle(chars: string[]) {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    const swap = chars[i];

    chars[i] = chars[j];
    chars[j] = swap;
  }

  return chars;
}

/**
 * 構造性生成：必含類別各先取至少一字元、餘位由全字集補滿、CSPRNG 洗牌 ⇒ 產出**恆滿足**政策的
 * 四類要求與長度界，不必產完再回頭驗、也就沒有「驗不過就無限重試」的路徑。
 * `forbidUsername`：與帳號名大小寫不敏感相等即重抽（機率趨零，迴圈上限純屬防禦）。
 */
function generate() {
  const { min, max } = lengthRange.value;
  const sets = requiredSets.value;
  // 長度收斂：欄位值 → 政策界 → 必含類別數（少於類別數就塞不下每類至少一字元）
  const len = Math.max(Math.min(Math.max(length.value ?? PREFERRED_LENGTH, min), max), sets.length);

  length.value = len;

  const pool = UPPER + LOWER + DIGIT + SPECIAL;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const chars = sets.map(set => set[randInt(set.length)]);

    while (chars.length < len) {
      chars.push(pool[randInt(pool.length)]);
    }

    const candidate = shuffle(chars).join('');
    const hitsUserName =
      Boolean(props.policy?.forbidUsername) &&
      props.userName !== '' &&
      candidate.toLowerCase() === props.userName.toLowerCase();

    if (!hitsUserName) {
      generated.value = candidate;
      return;
    }
  }
}

/**
 * 長度欄的變更處理：★`null`（＝欄位被清空）當「還沒填完」看待，不產生、也不回寫。
 *
 * NInputNumber 的 `updateValueOnInput` 預設為真，打字途中低於 `min`／高於 `max` 的中間值會被
 * `isInputing` 擋住不上拋（故逐字打的過程本身安全）——**唯獨清空是例外**：`parse('')` 回 `null`
 * 且不算 wip 值，當場就把 `null` 上拋。若照樣呼叫 [`generate`]，它會以 `PREFERRED_LENGTH` 回寫
 * `length`、欄位當場跳回 16，使用者接著補打「24」就成了「1624」、失焦再被 clamp 成上限——
 * 拿到的長度不是他指定的那一個，且全程沒有任何提示說長度被改過。
 * 早退之後：欄位維持空、`length` 維持 `null`，補打的數字就是使用者真正指定的長度；
 * 空著直接按「重新生成」仍走 [`generate`] 的 `?? PREFERRED_LENGTH` 退路並回寫，欄位顯示的
 * 即是這次實際用的長度。
 */
function handleLengthUpdate(value: number | null) {
  if (value === null) {
    return;
  }

  generate();
}

// 開浮層＝先產一組（省一次點擊）並把長度復位到政策界內的預設值；關閉即清值，不留殘影
watch(visible, opened => {
  if (opened) {
    const { min, max } = lengthRange.value;

    length.value = Math.min(Math.max(PREFERRED_LENGTH, min), max);
    generate();
  } else {
    generated.value = '';
  }
});

/**
 * 寫剪貼簿，**如實回報成敗**（`true`＝確實寫進去了）
 *
 * ★不用 `@vueuse/core` 的 `useClipboard`：那支的 `copy()` 在 `navigator.clipboard.write` 拋錯時
 * 於 catch 內把失敗吞掉、轉走 `document.execCommand` 且**不看其回傳值**，最後無條件把 `copied`
 * 置真——呼叫端因此拿不到任何「真的寫進去了嗎」的訊號。照它出成功 toast 就是本 repo 已立帳的
 * B-061「假成功 toast」同族：非安全來源或剪貼簿權限被拒時，使用者看到「已複製」、貼出來的卻是
 * 上一次的剪貼簿內容。（rev4 同處亦是無條件 toast＝瑕疵不抄。）
 * ★兩條路徑各自的成敗訊號：Clipboard API 失敗會 reject；legacy 路徑的 `execCommand` 回傳
 * boolean，停用該指令的瀏覽器回 `false`——兩者都據實往上傳。
 */
async function writeClipboard(value: string) {
  // 現代路徑（`http://127.0.0.1` 亦屬安全來源，開發埠走的就是這條）
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // 不吞成「成功」，落回下方 legacy 路徑再試一次
    }
  }

  // legacy 路徑：非安全來源（例如以區網 IP 走 http 進來）下 navigator.clipboard 不存在
  const ta = document.createElement('textarea');

  ta.value = value;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  ta.setAttribute('readonly', '');
  document.body.appendChild(ta);
  ta.select();

  const copied = document.execCommand('copy');

  ta.remove();

  return copied;
}

async function handleCopy() {
  if (generated.value === '') {
    return;
  }

  // ★寫成功才說成功；失敗時明講失敗並指路（產出值就在上方唯讀欄裡，選取後手動複製即可）
  if (await writeClipboard(generated.value)) {
    window.$message?.success($t('page.manage.user.pwdGen.copied'));
    return;
  }

  window.$message?.warning($t('page.manage.user.pwdGen.copyFailed'));
}

// 帶入＝把產出值交給掛載端填欄＋關閉浮層。★**不順手寫剪貼簿、也不出 toast**：這顆鈕做的事是
// 「填進去」，效果在關閉後的那個輸入欄上當場看得到；借用「已複製到剪貼簿」的文案等於鈕做的事
// 與 toast 講的事不是同一件（何況那句話當時還無從保證為真）。要剪貼簿的人按旁邊的「複製」。
function handleApply() {
  if (generated.value === '') {
    return;
  }

  emit('apply', generated.value);
  visible.value = false;
}
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="$t('page.manage.user.pwdGen.title')" class="w-420px lt-sm:w-300px">
    <NSpace vertical :size="16">
      <!--
        產出值刻意以明文顯示、不做遮蔽切換：它是一組「剛產出、還沒設進任何帳號」的候選字串，
        使用者當下要做的事就是讀它、抄它——遮起來只是逼人多按一次眼睛鈕。設進去之後的那份
        由後端雜湊保管，前端任何一處都拿不回來。
      -->
      <NInput :value="generated" readonly />
      <NSpace align="center" justify="space-between">
        <NSpace align="center" :size="8">
          <span class="text-14px">{{ $t('page.manage.user.pwdGen.length') }}</span>
          <NInputNumber
            v-model:value="length"
            class="w-120px"
            :min="lengthRange.min"
            :max="lengthRange.max"
            @update:value="handleLengthUpdate"
          />
        </NSpace>
        <NSpace :size="8">
          <NButton size="small" @click="generate">{{ $t('page.manage.user.pwdGen.generate') }}</NButton>
          <NButton size="small" @click="handleCopy">{{ $t('page.manage.user.pwdGen.copy') }}</NButton>
          <NButton size="small" type="primary" @click="handleApply">
            {{ $t('page.manage.user.pwdGen.apply') }}
          </NButton>
        </NSpace>
      </NSpace>
    </NSpace>
  </NModal>
</template>

<style scoped></style>
