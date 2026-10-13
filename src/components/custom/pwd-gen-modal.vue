<!-- [rev6-inline MANAGE-USER-VIEW+ 007-user-password-admin] 產密浮層共用元件（新增檔；上游基線無此路徑）——依密碼政策投影於本地構造一組合規密碼，可調長度、可複製、可帶入掛載端之設密欄 -->
<script setup lang="ts">
// 對外契約：props 收政策七鍵投影（掛載端讀好再傳入——本元件零網路請求）與標的帳號名（`forbidUsername` 之比對對象）；「帶入」以
// `apply` 事件把產出值交給掛載端，填哪一欄、填完要不要再經一次確認，由掛載端決定（使用者頁之重設流程帶入後仍須按確定；
// 新增抽屜帶入即填欄、送出前本有確定鈕）。產出值只存在於本元件之狀態與事件參數：不寫日誌、不落任何持久儲存，關閉浮層即清空。
// 亂數一律取 `crypto.getRandomValues`（密碼學安全亂數）：一般偽亂數之序列可由狀態推回，拿它產密碼等於產出可被重建之密碼。
// 前端只負責「產一組合規的」，不負責「判它合不合規」：送出後仍由後端依當下政策裁決。
// 出處：rev5:src/components/custom/pwd-gen-modal.vue（對外形、構造性產生加洗牌、長度欄清空之處置、版式）。rev6 差異：複製只走
// Clipboard API、寫不進去即如實報失敗——rev5 於其失敗後落回已棄用之 execCommand 舊路徑再試，rev6 不帶回。
import { computed, ref, watch } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdGenModal'
});

interface Props {
  /** 政策七鍵投影；`null`＝掛載端讀不到（讀失敗或尚未載入）⇒ 以下方後備界產生 */
  policy: Api.UserCenter.PasswordPolicyView | null;
  /** 標的帳號名（`forbidUsername` 之比對對象）；空字串＝略過比對 */
  userName?: string;
}

const props = withDefaults(defineProps<Props>(), { userName: '' });

interface Emits {
  (e: 'apply', password: string): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

/** 政策讀不到時之長度後備界：只是「產多長」的預設，不是規則主張（長度規則在後端） */
const FALLBACK_MIN_LENGTH = 8;
const FALLBACK_MAX_LENGTH = 64;
/** 預設產出長度：明顯高於常見下限、又不至於難以人工抄寫 */
const PREFERRED_LENGTH = 16;
/** 產出值恰與帳號名相同時之重抽上限：機率趨零，上限只為讓迴圈必定收住 */
const MAX_ATTEMPTS = 10;

// 四類字元集與後端政策之字元類同界：數字 [0-9]、小寫 [a-z]、大寫 [A-Z]、特殊＝[^A-Za-z0-9]。特殊字元只取一組可列印子集——
// 仍落在 [^A-Za-z0-9] 內，避開引號、反斜線與空白這類轉貼途中容易走樣的字元。
const DIGITS = '0123456789';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SPECIALS = '!@#$%^&*()-_=+[]{}.,?~';
/** 補位字元之來源＝四類之聯集：補位落在哪一類都不違任何規則 */
const ALL_CHARS = DIGITS + LOWERCASE + UPPERCASE + SPECIALS;

/** 當前產出值（唯讀展示） */
const generated = ref('');

/** 產出長度（可調）。型含 `null`：數字欄可被清空，清空期間不產生、見 handleLengthUpdate */
const length = ref<number | null>(PREFERRED_LENGTH);

/** 長度可調範圍＝政策上下限；上限低於下限之矛盾政策以下限為準（寧可產長、不可產不出來；送出後由後端照政策裁決） */
const lengthRange = computed(() => {
  const min = props.policy ? props.policy.minLength : FALLBACK_MIN_LENGTH;
  const max = props.policy ? props.policy.maxLength : FALLBACK_MAX_LENGTH;

  return { min, max: Math.max(min, max) };
});

/** 政策要求必含之字元類（空集合＝四類皆非必含，補位照樣取自四類聯集） */
const requiredSets = computed(() => {
  const sets: string[] = [];

  if (props.policy?.requireDigit) {
    sets.push(DIGITS);
  }

  if (props.policy?.requireLowercase) {
    sets.push(LOWERCASE);
  }

  if (props.policy?.requireUppercase) {
    sets.push(UPPERCASE);
  }

  if (props.policy?.requireSpecial) {
    sets.push(SPECIALS);
  }

  return sets;
});

/**
 * 均勻取 `[0, bound)` 之整數（亂數源＝`crypto.getRandomValues`）。32 位元亂數直接對 bound 取餘時，2^32 若不是 bound 之整數倍，
 * 前段餘數會多出一次機會（模偏差）；故只收小於 `limit`（＝不超過 2^32 之 bound 最大整數倍）之值、其餘棄置重抽，收下之值對 bound
 * 取餘即均勻。
 */
function randomIndex(bound: number) {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / bound) * bound;
  let value = 0;

  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % bound;
}

/** Fisher–Yates 洗牌（自末位往前，第 i 位與 `[0, i]` 均勻取出之一位交換）：不洗的話，必含類別那幾枚固定落在字串開頭、形成可猜之樣式 */
function shuffle(chars: string[]) {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    const swap = chars[i];

    chars[i] = chars[j];
    chars[j] = swap;
  }

  return chars;
}

/** 產出值與帳號名不分大小寫相等（政策開了 `forbidUsername` 才比；帳號名空字串＝略過） */
function equalsUserName(candidate: string) {
  return (
    Boolean(props.policy?.forbidUsername) &&
    props.userName !== '' &&
    candidate.toLowerCase() === props.userName.toLowerCase()
  );
}

/**
 * 構造性產生：每個必含類別先各取一枚、其餘位數自四類聯集補滿，再整串洗牌——產出恆含每個必含類別、長度恆為下方收斂所得之值，
 * 不必產完再回頭驗，也就沒有「驗不過就一直重試」的路徑。政策本身無合規解時（上下限矛盾、或上限小於必含類別數），長度以下限或
 * 必含類別數為準、送出後由後端拒收。唯一重抽之由是恰與帳號名相同（上限 MAX_ATTEMPTS）；重抽用盡則清空產出值（複製與帶入皆不作用），
 * 不留下前一組。
 */
function generate() {
  const { min, max } = lengthRange.value;
  const sets = requiredSets.value;
  // 長度收斂：欄值（清空時取預設長度）→ 夾進政策界 → 不少於必含類別數（少於類別數就放不下每類一枚）
  const size = Math.max(Math.min(Math.max(length.value ?? PREFERRED_LENGTH, min), max), sets.length);

  length.value = size;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const chars = sets.map(set => set[randomIndex(set.length)]);

    while (chars.length < size) {
      chars.push(ALL_CHARS[randomIndex(ALL_CHARS.length)]);
    }

    const candidate = shuffle(chars).join('');

    if (!equalsUserName(candidate)) {
      generated.value = candidate;
      return;
    }
  }

  generated.value = '';
}

/**
 * 長度欄之變更：`null`（欄位被清空）視為「還沒填完」，不產生、不回寫。數字欄打字途中超出上下限之中間值不會上拋，唯獨清空當場
 * 上拋 `null`；若照樣產生，就會以預設長度回寫、欄位當場跳回 16，接著補打的數字被接在 16 後面、失焦又被夾回上限——拿到的長度不是
 * 使用者指定的那一個、且沒有任何提示。早退之後欄位維持空、補打的數字即所指定之長度；空著直接按「重新產生」仍以預設長度產生並回寫。
 */
function handleLengthUpdate(value: number | null) {
  if (value === null) {
    return;
  }

  generate();
}

// 開浮層即產一組（省一次點擊）並把長度復位到政策界內之預設值；關閉即清空產出值
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
 * 寫入剪貼簿、如實回報成敗（true＝確實寫進去了）。只走 Clipboard API：不存在（非安全來源，例如以區網位址走 http 開頁）或寫入被拒
 * （權限、焦點）皆回 false——不假報成功，以免使用者以為已複製、貼出來卻是前一次的內容。
 */
async function writeClipboard(text: string) {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function handleCopy() {
  if (generated.value === '') {
    return;
  }

  // 寫成功才說成功；失敗時明講並指路（產出值就在上方唯讀欄，選取後手動複製即可）
  if (await writeClipboard(generated.value)) {
    window.$message?.success($t('page.manage.user.pwdGen.copied'));
    return;
  }

  window.$message?.warning($t('page.manage.user.pwdGen.copyFailed'));
}

// 帶入＝把產出值交給掛載端並關閉浮層；不順手寫剪貼簿、不出提示——效果在關閉後的那一欄上當場看得到
function handleApply() {
  if (generated.value === '') {
    return;
  }

  emit('apply', generated.value);
  visible.value = false;
}
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="$t('page.manage.user.pwdGen.title')"
    class="w-420px lt-sm:w-300px"
  >
    <NSpace vertical :size="16">
      <!-- 產出值刻意明文顯示、不設遮蔽切換：它是一組尚未設進任何帳號之候選字串，使用者此刻要做的就是讀它、抄它 -->
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
