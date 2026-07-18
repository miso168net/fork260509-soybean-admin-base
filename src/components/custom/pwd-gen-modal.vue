<!-- BASE-WEB-MODAL-WIRING(k) (015-pwd-custody)：net-new 產密浮層共用元件（T016、contracts C6；
  憲法 §III.2(k) 顯式授權 src/components/ 檔位）。對外契約：props policy（getPasswordPolicy 結果形）
  ＋userName（forbid_username 大小寫不敏感比對源）；「產生」＝本地 CSPRNG（crypto.getRandomValues、
  絕非 Math.random）構造性滿足政策全部規則、零網路請求；唯讀 input＋顯示密碼切換＋一鍵複製＋
  「帶入」emit apply(password)；密碼值恆不入 log/console。★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdGenModal'
});

interface Props {
  /** 密碼政策（getPasswordPolicy 結果形；7 鍵 password_*、掛載端讀好傳入——本元件零網路請求） */
  policy: Api.UserCenter.PasswordPolicyItem[];
  /** 標的帳號名（forbid_username 比對源；空字串＝略過比對。★須為真帳號、非 nick_name 別名） */
  userName?: string;
}

const props = withDefaults(defineProps<Props>(), { userName: '' });

const emit = defineEmits<{ apply: [password: string] }>();

const show = defineModel<boolean>('show', { default: false });

/** 當前產生值（唯讀展示；關閉浮層即清空、不留存） */
const generated = ref('');
const showPlain = ref(false);

// legacy fallback（execCommand）：非 https 開發環境 Clipboard API 可能不可用
const { copy, copied } = useClipboard({ legacy: true });

// 開浮層即自動先產一組（省一次點擊）；關閉即清值與明文切換狀態
watch(show, opened => {
  if (opened) {
    generate();
  } else {
    generated.value = '';
    showPlain.value = false;
  }
});

// 字元類別集：與後端政策 regex 同界（upper [A-Z]／lower [a-z]／digit [0-9]／special [^A-Za-z0-9]）；
// special 取常見可列印安全子集（仍滿足 [^A-Za-z0-9]、避開引號/反斜線/空白等易出事字元）
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGIT = '0123456789';
const SPECIAL = '!@#$%^&*()-_=+[]{}.,?~';

/** CSPRNG 均勻整數 [0, bound)：rejection sampling 去模偏差；一律 crypto.getRandomValues（島 I5） */
function randInt(bound: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / bound) * bound;
  let v = 0;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % bound;
}

/** Fisher–Yates 洗牌（CSPRNG 索引） */
function shuffle(chars: string[]): string[] {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
}

/**
 * 構造性生成（FR-008）：必含類別各先取至少 1 字元、餘位由全字集補滿、CSPRNG 洗牌——
 * 產出恆滿足政策全部 require 規則與長度界；全字集恆含四類（非必含類別可出現、不違任何規則）。
 * 長度＝政策下限與上限間安全值（偏 16；畸形政策上限低於下限時以下限為準）。
 * forbid_username：與帳號名大小寫不敏感相等即重生成（機率趨零、迴圈上限純防禦）。
 */
function generate() {
  const map = new Map(props.policy.map(item => [item.settingKey, item.settingValue]));
  const num = (key: string) => {
    const parsed = Number.parseInt(map.get(key) ?? '', 10);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const on = (key: string) => map.get(key) === 'on';

  const lo = num('password_min_length') ?? 8;
  const hi = Math.max(num('password_max_length') ?? 64, lo);
  const required = [
    on('password_require_uppercase') ? UPPER : '',
    on('password_require_lowercase') ? LOWER : '',
    on('password_require_digit') ? DIGIT : '',
    on('password_require_special') ? SPECIAL : ''
  ].filter(Boolean);
  const len = Math.max(Math.min(Math.max(lo, 16), hi), required.length);
  const pool = UPPER + LOWER + DIGIT + SPECIAL;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const chars = required.map(set => set[randInt(set.length)]);
    while (chars.length < len) {
      chars.push(pool[randInt(pool.length)]);
    }
    const candidate = shuffle(chars).join('');
    const hitsUserName =
      on('password_forbid_username') &&
      props.userName !== '' &&
      candidate.toLowerCase() === props.userName.toLowerCase();
    if (!hitsUserName) {
      generated.value = candidate;
      return;
    }
  }
}

function handleCopy() {
  if (generated.value !== '') {
    copy(generated.value);
  }
}

function handleApply() {
  if (generated.value === '') {
    return;
  }
  emit('apply', generated.value);
  show.value = false;
}
</script>

<template>
  <NModal v-model:show="show" preset="card" :title="$t('pwdGen.title')" class="w-420px lt-sm:w-300px">
    <NSpace vertical :size="16">
      <NInput :value="generated" readonly :type="showPlain ? 'text' : 'password'" />
      <NSpace align="center" justify="space-between">
        <NSpace align="center" :size="8">
          <NSwitch v-model:value="showPlain" size="small" />
          <span class="text-14px">{{ $t('pwdGen.showPassword') }}</span>
        </NSpace>
        <NSpace :size="8">
          <NButton size="small" @click="generate">{{ $t('pwdGen.generate') }}</NButton>
          <!-- copied 短暫轉綠＝複製成功視覺回饋（零額外 i18n 鍵；vueuse copied 1.5s 自復位） -->
          <NButton size="small" :type="copied ? 'success' : 'default'" @click="handleCopy">
            {{ $t('pwdGen.copy') }}
          </NButton>
          <NButton size="small" type="primary" @click="handleApply">{{ $t('pwdGen.apply') }}</NButton>
        </NSpace>
      </NSpace>
    </NSpace>
  </NModal>
</template>

<style scoped></style>
