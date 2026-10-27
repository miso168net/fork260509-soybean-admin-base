// [rev6-inline BASE-WEB-I18N-WIRING+ 003-auth-session] 繁中 locale——rev6 自有檔、BASE-WEB-I18N-WIRING(iii) 新增型（整檔、不入名冊）：以 `App.I18n.Schema` 標型之完整全樹、經 `src/locales/locale.ts` 註冊進 runtime（ADR-00084）；backend 子樹為跨端閘右源之一、即後端 msg key 繁中譯文的權威（首批鍵的史料出處＝`specs/003-auth-session/contracts/msg-keys.md`）；其餘各樹以 zh-cn 現行措辭之臺灣用語對譯
// ★鍵集紀律：全樹鍵集由 `App.I18n.Schema` 標型守（缺鍵、多鍵皆 typecheck 紅）；backend 子樹另須與 rust-api `MSG_KEYS` 逐鍵全等（鍵數以該陣列與跨端閘輸出為準、此處不抄）——少鍵＝缺譯、多鍵＝孤兒，皆由 `python3 tools/msg-key-gate.py check` 攔（rc 1 指名檔與鍵）；
//   下方 backend 樹之開括號行須為本檔首個獨佔一行之 `backend: {`（跨端閘右源錨取首個命中；其前若另有同形行、跨端閘即讀錯子樹），本檔把 backend 樹置於全樹之首以保此序。
const local: App.I18n.Schema = {
  backend: {
    common: { success: '操作成功' },
    system: { internal: '系統發生內部錯誤，請稍後再試', notFound: '找不到請求的資源', forbidden: '沒有權限執行此操作' },
    auth: {
      login: { failed: '帳號或密碼錯誤' },
      session: {
        reLogin: '請重新登入',
        kicked: '您的帳號已在其他裝置登入，此工作階段已被頂替',
        kickedByAdmin: '此工作階段已被管理員結束，請重新登入'
      },
      token: { expired: '登入已逾時，正在重新取得授權' }
    },
    biz: {
      systemSettings: {
        invalidValue: '設定值不合法（型別不符、超出範圍或非允許選項）',
        notFound: '找不到指定的設定鍵'
      },
      auth: {
        notSupported: '該功能尚未開放',
        captchaRequired: '請完成圖形驗證碼後再試',
        locked: '嘗試次數過多，請稍後再試'
      },
      ipRule: {
        invalidRuleType: '規則類型不合法',
        invalidCidr: '網段格式不合法',
        conflict: '已有相同網段與類型的規則',
        notFound: '找不到指定的規則，或其目前狀態不允許此操作',
        selfLock: '此變更會擋住您目前的連線，已拒絕寫入'
      },
      throttle: { invalidUnlockTarget: '解鎖對象不合法' },
      role: {
        codeInvalid: '角色代碼格式不合法：僅允許字母、數字與底線，最長 64 個字元',
        codeExists: '此角色代碼已被現有角色使用',
        codeImmutable: '角色代碼建立後不可修改',
        notFound: '角色不存在或已刪除',
        seededProtected: '系統內建角色不可刪除',
        inUse: '此角色仍有使用者掛載（含已停用或已刪除的帳號），不可刪除',
        cannotDeleteSelfRole: '不可刪除您自己帳號所屬的角色',
        cannotDisableSelfRole: '不可停用您自己帳號所屬的角色',
        superCannotDisable: '超級管理員角色不可停用',
        nameRequired: '角色名稱為必填，不可為空',
        protectedRevoke: '存在受保護的授權，無法撤銷',
        protectedGrant: '受保護的端點僅限超級管理員持有'
      },
      menu: {
        notFound: '找不到指定的選單，或其目前狀態不允許此操作',
        routeNameExists: '此路由名稱已被現有選單使用，或為系統保留的路由名稱',
        routeNameImmutable: '路由名稱建立後不可修改',
        menuTypeImmutable: '選單類型建立後不可修改',
        parentNotFound: '父選單不存在或已刪除',
        cycleDetected: '不可將選單移到其自身或其子孫選單之下',
        protectedMenu: '受保護的選單不可刪除、不可停用，也不可變更其父選單',
        constantParent: '常數選單只能掛在常數父選單之下；其下仍有常數子孫選單時，也不可取消本身的常數設定',
        nameRequired: '選單名稱為必填，不可為空',
        routeNameInvalid: '路由名稱格式不合法：僅允許字母、數字、底線與連字號，最長 100 個字元',
        hrefInvalid: '外部連結須以 http:// 或 https:// 開頭',
        buttonsInvalid: '按鈕清單格式不合法：每個按鈕須有不為空且不重複的代碼，最長 100 個字元',
        hasChildren: '此選單下仍有子選單（含已停用者），請先處理其子選單',
        restoreConflict: '此選單的路由名稱已被現有選單使用，無法復原',
        protectedButtonRemove: '按鈕清單不可移除或變更仍有受保護授權的按鈕代碼'
      },
      policy: {
        notRestorable: '該歸檔授權不可復原'
      },
      user: {
        notFound: '使用者不存在或已刪除',
        userNameInvalid: '使用者名稱格式不合法',
        userNameExists: '此使用者名稱已被現有使用者使用',
        userNameImmutable: '使用者名稱建立後不可修改',
        userEmailInvalid: '信箱格式不合法',
        userEmailExists: '此信箱已被現有使用者使用',
        roleNotFound: '指派的角色不存在或已刪除',
        seededProtected: '系統內建帳號受保護：不可刪除，超級管理員帳號亦不可移除超級管理員角色',
        superCannotDisable: '超級管理員帳號不可停用',
        cannotEditSelfRoleOrStatus: '不可修改您自己帳號的角色或狀態',
        passwordPolicy: '密碼不符合安全政策：{violations}',
        cannotDeleteSelf: '不可刪除您自己的帳號',
        cannotKickSelf: '不可踢除您自己的帳號',
        cannotResetSelfPassword: '請至個人中心修改您自己的密碼',
        sessionPolicyInvalid: '工作階段政策不合法',
        pwdSetTooFrequent: '密碼設定過於頻繁，請於 {remainingSeconds} 秒後再試',
        passwordConfirmMismatch: '兩次輸入的密碼不一致',
        changePasswordThrottled: '嘗試次數過多，請稍後再試',
        oldPasswordMismatch: '舊密碼不正確',
        passwordSameAsOld: '新密碼不可與舊密碼相同'
      },
      audit: {
        invalidTable: '清理目標不在允許清單內',
        purgeBelowFloor: '清理保留天數不可低於 {minDays} 天'
      }
    }
  },
  system: {
    title: 'Soybean 管理系統',
    updateTitle: '系統版本更新通知',
    updateContent: '偵測到系統有新版本發布，是否立即重新整理頁面？',
    updateConfirm: '立即重新整理',
    updateCancel: '稍後再說'
  },
  common: {
    action: '操作',
    add: '新增',
    addSuccess: '新增成功',
    backToHome: '返回首頁',
    batchDelete: '批次刪除',
    cancel: '取消',
    close: '關閉',
    check: '勾選',
    selectAll: '全選',
    expandColumn: '展開欄',
    columnSetting: '欄位設定',
    config: '設定',
    confirm: '確認',
    delete: '刪除',
    deleteSuccess: '刪除成功',
    confirmDelete: '確認刪除嗎？',
    edit: '編輯',
    warning: '警告',
    error: '錯誤',
    index: '序號',
    keywordSearch: '請輸入關鍵字搜尋',
    logout: '登出',
    logoutConfirm: '確認登出嗎？',
    lookForward: '敬請期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '無資料',
    operate: '操作',
    pleaseCheckValue: '請檢查輸入的值是否合法',
    refresh: '重新整理',
    reset: '重設',
    search: '搜尋',
    switch: '切換',
    tip: '提示',
    trigger: '觸發',
    update: '更新',
    updateSuccess: '更新成功',
    userCenter: '個人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  request: {
    logout: '請求失敗後登出使用者',
    logoutMsg: '使用者狀態失效，請重新登入',
    logoutWithModal: '請求失敗後彈出對話框再登出使用者',
    logoutWithModalMsg: '使用者狀態失效，請重新登入',
    refreshToken: '請求的token已過期，更新token',
    tokenExpired: 'token已過期'
  },
  theme: {
    themeDrawerTitle: '主題設定',
    tabs: {
      appearance: '外觀',
      layout: '版面',
      general: '一般',
      preset: '預設集'
    },
    appearance: {
      themeSchema: {
        title: '主題模式',
        light: '淺色模式',
        dark: '深色模式',
        auto: '跟隨系統'
      },
      grayscale: '灰階模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主題色彩',
        primary: '主色',
        info: '資訊色',
        success: '成功色',
        warning: '警告色',
        error: '錯誤色',
        followPrimary: '跟隨主色'
      },
      themeRadius: {
        title: '主題圓角'
      },
      recommendColor: '套用推薦演算法的色彩',
      recommendColorDesc: '推薦色彩的演算法參考',
      preset: {
        title: '主題預設集',
        apply: '套用',
        applySuccess: '預設集套用成功',
        default: {
          name: '標準預設集',
          desc: 'Soybean 標準主題預設集'
        },
        dark: {
          name: '深色預設集',
          desc: '適合夜間使用的深色主題預設集'
        },
        compact: {
          name: '緊湊型',
          desc: '適合小螢幕的緊湊版面預設集'
        },
        azir: {
          name: 'Azir的預設集',
          desc: 'Azir 偏愛的莫蘭迪色系冷淡風'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '版面模式',
        vertical: '左側選單模式',
        'vertical-mix': '左側選單混合模式',
        'vertical-hybrid-header-first': '左側混合-頂部優先',
        horizontal: '頂部選單模式',
        'top-hybrid-sidebar-first': '頂部混合-側邊優先',
        'top-hybrid-header-first': '頂部混合-頂部優先',
        vertical_detail: '左側選單版面，選單在左，內容在右。',
        'vertical-mix_detail': '左側雙選單版面，第一層選單在左側深色區域，第二層選單在左側淺色區域。',
        'vertical-hybrid-header-first_detail':
          '左側混合版面，第一層選單在頂部，第二層選單在左側深色區域，第三層選單在左側淺色區域。',
        horizontal_detail: '頂部選單版面，選單在頂部，內容在下方。',
        'top-hybrid-sidebar-first_detail': '頂部混合版面，第一層選單在左側，第二層選單在頂部。',
        'top-hybrid-header-first_detail': '頂部混合版面，第一層選單在頂部，第二層選單在左側。'
      },
      tab: {
        title: '分頁列設定',
        visible: '顯示分頁列',
        cache: '分頁列資訊快取',
        cacheTip: '離開頁面後仍保留分頁列資訊',
        height: '分頁列高度',
        mode: {
          title: '分頁列樣式',
          slider: '滑塊樣式',
          chrome: 'Chrome 樣式',
          button: '按鈕樣式'
        },
        closeByMiddleClick: '滑鼠中鍵關閉分頁',
        closeByMiddleClickTip: '啟用後可用滑鼠中鍵點擊分頁將其關閉'
      },
      header: {
        title: '頁首設定',
        height: '頁首高度',
        breadcrumb: {
          visible: '顯示麵包屑',
          showIcon: '顯示麵包屑圖示'
        }
      },
      sider: {
        title: '側邊欄設定',
        inverted: '深色側邊欄',
        width: '側邊欄寬度',
        collapsedWidth: '側邊欄收合寬度',
        mixWidth: '混合版面側邊欄寬度',
        mixCollapsedWidth: '混合版面側邊欄收合寬度',
        mixChildMenuWidth: '混合版面子選單寬度',
        autoSelectFirstMenu: '自動選取第一個子選單',
        autoSelectFirstMenuTip: '點擊第一層選單時，自動選取並導覽至第一個子選單的最深層級'
      },
      footer: {
        title: '頁尾設定',
        visible: '顯示頁尾',
        fixed: '固定頁尾',
        height: '頁尾高度',
        right: '頁尾靠右'
      },
      content: {
        title: '內容區域設定',
        scrollMode: {
          title: '捲動模式',
          tip: '主體捲動僅 main 區塊捲動，外層捲動可連同頁首與頁尾一起捲動',
          wrapper: '外層捲動',
          content: '主體捲動'
        },
        page: {
          animate: '頁面切換動畫',
          mode: {
            title: '頁面切換動畫類型',
            'fade-slide': '滑動',
            fade: '淡入淡出',
            'fade-bottom': '底部淡出',
            'fade-scale': '縮放淡出',
            'zoom-fade': '漸變',
            'zoom-out': '閃現',
            none: '無'
          }
        },
        fixedHeaderAndTab: '固定頁首和分頁列'
      }
    },
    general: {
      title: '一般設定',
      watermark: {
        title: '浮水印設定',
        visible: '顯示全螢幕浮水印',
        text: '自訂浮水印文字',
        enableUserName: '啟用使用者名稱浮水印',
        enableTime: '顯示目前時間',
        timeFormat: '時間格式'
      },
      multilingual: {
        title: '多語言設定',
        visible: '顯示多語言按鈕'
      },
      globalSearch: {
        title: '全域搜尋設定',
        visible: '顯示全域搜尋按鈕'
      }
    },
    configOperation: {
      copyConfig: '複製設定',
      copySuccessMsg: '複製成功，請取代 src/theme/settings.ts 中的變數 themeSettings',
      resetConfig: '重設設定',
      resetSuccessMsg: '重設成功'
    }
  },
  route: {
    login: '登入',
    403: '無權限',
    404: '頁面不存在',
    500: '伺服器錯誤',
    'iframe-page': '外部連結頁面',
    home: '首頁',
    document: '文件',
    document_project: '專案文件',
    'document_project-link': '專案文件(外部連結)',
    document_video: '影片教學',
    document_vue: 'Vue文件',
    document_vite: 'Vite文件',
    document_unocss: 'UnoCSS文件',
    document_naive: 'Naive UI文件',
    'document_pro-naive': 'Pro Naive UI文件',
    document_antd: 'Ant Design Vue文件',
    document_alova: 'Alova文件',
    'user-center': '個人中心',
    about: '關於',
    function: '系統功能',
    alova: 'alova範例',
    alova_request: 'alova請求',
    alova_scenes: '情境化請求',
    'pro-naive': 'Pro Naive UI 範例',
    'pro-naive_form': '表單',
    'pro-naive_form_basic': '基礎表單',
    'pro-naive_form_query': '查詢表單',
    'pro-naive_form_step': '分步驟表單',
    'pro-naive_table': '表格',
    'pro-naive_table_remote': '遠端載入',
    'pro-naive_table_row-edit': '列編輯',
    function_tab: '分頁',
    'function_multi-tab': '多分頁',
    'function_hide-child': '隱藏子選單',
    'function_hide-child_one': '隱藏子選單',
    'function_hide-child_two': '選單二',
    'function_hide-child_three': '選單三',
    function_request: '請求',
    'function_toggle-auth': '切換權限',
    'function_super-page': '超級管理員可見',
    manage: '系統管理',
    'manage_system-settings': '系統設定',
    manage_user: '使用者管理',
    'manage_user-detail': '使用者詳情',
    manage_audit: '稽核中心',
    manage_role: '角色管理',
    'manage_policy-archive': '授權回收桶',
    manage_menu: '選單管理',
    'manage_ip-rule': 'IP 規則管理',
    'multi-menu': '多層選單',
    'multi-menu_first': '選單一',
    'multi-menu_first_child': '選單一子選單',
    'multi-menu_second': '選單二',
    'multi-menu_second_child': '選單二子選單',
    'multi-menu_second_child_home': '選單二子選單首頁',
    exception: '例外頁',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    plugin: '外掛範例',
    plugin_copy: '剪貼簿',
    plugin_charts: '圖表',
    plugin_charts_echarts: 'ECharts',
    plugin_charts_antv: 'AntV',
    plugin_charts_vchart: 'VChart',
    plugin_editor: '編輯器',
    plugin_editor_quill: '富文字編輯器',
    plugin_editor_markdown: 'MD 編輯器',
    plugin_icon: '圖示',
    plugin_map: '地圖',
    plugin_print: '列印',
    plugin_swiper: 'Swiper',
    plugin_video: '影片',
    plugin_barcode: '條碼',
    plugin_pinyin: '拼音',
    plugin_excel: 'Excel',
    plugin_pdf: 'PDF 預覽',
    plugin_gantt: '甘特圖',
    plugin_gantt_dhtmlx: 'dhtmlxGantt',
    plugin_gantt_vtable: 'VTableGantt',
    plugin_typeit: '打字機',
    plugin_tables: '表格',
    plugin_tables_vtable: 'VTable'
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登入 / 註冊',
        userNamePlaceholder: '請輸入使用者名稱',
        phonePlaceholder: '請輸入手機號碼',
        codePlaceholder: '請輸入驗證碼',
        passwordPlaceholder: '請輸入密碼',
        confirmPasswordPlaceholder: '請再次輸入密碼',
        codeLogin: '驗證碼登入',
        confirm: '確定',
        back: '返回',
        validateSuccess: '驗證成功',
        loginSuccess: '登入成功',
        welcomeBack: '歡迎回來，{userName} ！'
      },
      pwdLogin: {
        title: '密碼登入',
        rememberMe: '記住我',
        forgetPassword: '忘記密碼？',
        register: '註冊帳號',
        otherAccountLogin: '其他帳號登入',
        otherLoginMode: '其他登入方式',
        superAdmin: '超級管理員',
        admin: '管理員',
        user: '一般使用者'
      },
      codeLogin: {
        title: '驗證碼登入',
        getCode: '取得驗證碼',
        reGetCode: '{time}秒後重新取得',
        sendCodeSuccess: '驗證碼傳送成功',
        imageCodePlaceholder: '請輸入圖形驗證碼'
      },
      register: {
        title: '註冊帳號',
        agreement: '我已詳細閱讀並接受',
        protocol: '《使用者條款》',
        policy: '《隱私權政策》'
      },
      resetPwd: {
        title: '重設密碼'
      },
      bindWeChat: {
        title: '綁定微信'
      }
    },
    about: {
      title: '關於',
      introduction: `SoybeanAdmin 是一個優雅且功能強大的後臺管理範本，採用最新的前端技術堆疊，包括 Vue3, Vite7, TypeScript, Pinia 和 UnoCSS。它內建豐富的主題設定與元件，程式碼規範嚴謹，實現了自動化的檔案路由系統。此外，它還採用了基於 ApiFox 的線上Mock資料方案。SoybeanAdmin 為您提供一站式的後臺管理解決方案，無需額外設定，開箱即用。同時也是快速學習前沿技術的最佳實踐。`,
      projectInfo: {
        title: '專案資訊',
        version: '版本',
        latestBuildTime: '最新建置時間',
        githubLink: 'Github 網址',
        previewLink: '預覽網址'
      },
      prdDep: '正式環境相依套件',
      devDep: '開發環境相依套件'
    },
    passwordPolicy: {
      violation: {
        minLength: '長度未達政策下限',
        maxLength: '長度超過政策上限',
        maxBytes: '位元組數超過上限',
        requireDigit: '須包含數字',
        requireLowercase: '須包含小寫字母',
        requireUppercase: '須包含大寫字母',
        requireSpecial: '須包含特殊字元',
        forbidUsername: '不可與使用者名稱相同'
      },
      listSeparator: '、'
    },
    home: {
      branchDesc:
        '為了方便大家開發與更新合併，我們精簡了main分支的程式碼，只保留首頁選單，其餘內容已移至example分支維護。預覽網址顯示的內容即為example分支的內容。',
      greeting: '早安，{userName}, 今天又是充滿活力的一天!',
      weatherDesc: '今日多雲轉晴，20℃ - 25℃!',
      projectCount: '專案數',
      todo: '待辦',
      message: '訊息',
      downloadCount: '下載量',
      registerCount: '註冊量',
      schedule: '作息安排',
      study: '學習',
      work: '工作',
      rest: '休息',
      entertainment: '娛樂',
      visitCount: '造訪量',
      turnover: '成交額',
      dealCount: '成交量',
      projectNews: {
        title: '專案動態',
        moreNews: '更多動態',
        desc1: 'Soybean 在2021年5月28日建立了開源專案 soybean-admin!',
        desc2: 'Yanbowe 向 soybean-admin 回報了一個bug，多分頁列不會自動調整。',
        desc3: 'Soybean 正為 soybean-admin 的發布做充分的準備工作!',
        desc4: 'Soybean 正忙著為soybean-admin撰寫專案說明文件！',
        desc5: 'Soybean 剛才把儀表板頁面隨手寫了一些，勉強能看了！'
      },
      creativity: '創意'
    },
    userCenter: {
      password: {
        title: '修改密碼',
        oldPassword: '舊密碼',
        newPassword: '新密碼',
        confirmPassword: '確認新密碼',
        submit: '儲存',
        success: '密碼已修改，其他裝置的登入已失效',
        hint: '密碼規則由系統設定決定、以伺服器端驗證為準；修改成功後本裝置保持登入，其他裝置需重新登入。'
      }
    },
    function: {
      tab: {
        tabOperate: {
          title: '分頁操作',
          addTab: '新增分頁',
          addTabDesc: '前往關於頁面',
          closeTab: '關閉分頁',
          closeCurrentTab: '關閉目前分頁',
          closeAboutTab: '關閉「關於」分頁',
          addMultiTab: '新增多分頁',
          addMultiTabDesc1: '前往多分頁頁面',
          addMultiTabDesc2: '前往多分頁頁面(帶有查詢參數)'
        },
        tabTitle: {
          title: '分頁標題',
          changeTitle: '修改標題',
          change: '修改',
          resetTitle: '重設標題',
          reset: '重設'
        }
      },
      multiTab: {
        routeParam: '路由參數',
        backTab: '返回 function_tab'
      },
      toggleAuth: {
        toggleAccount: '切換帳號',
        authHook: '權限鉤子函式 `hasAuth`',
        superAdminVisible: '超級管理員可見',
        adminVisible: '管理員可見',
        adminOrUserVisible: '管理員和使用者可見'
      },
      request: {
        repeatedErrorOccurOnce: '重複請求錯誤只出現一次',
        repeatedError: '重複請求錯誤',
        repeatedErrorMsg1: '自訂請求錯誤 1',
        repeatedErrorMsg2: '自訂請求錯誤 2'
      }
    },
    alova: {
      scenes: {
        captchaSend: '傳送驗證碼',
        autoRequest: '自動請求',
        visibilityRequestTips: '瀏覽器視窗切換時自動請求資料',
        pollingRequestTips: '每3秒自動請求一次',
        networkRequestTips: '網路重新連線後自動請求',
        refreshTime: '更新時間',
        startRequest: '開始請求',
        stopRequest: '停止請求',
        requestCrossComponent: '跨元件觸發請求',
        triggerAllRequest: '手動觸發所有自動請求'
      }
    },
    proNaive: {
      form: {
        basic: {
          title: '基礎範例',
          appName: '應用程式名稱',
          appStatus: '應用程式狀態',
          createTime: '建立時間',
          responseDate: '回應日期',
          specificationInfo: '規格資訊',
          specificate: '規格',
          specificationName: '規格名稱',
          specificationValue: '規格值',
          specificationColorRed: '紅',
          specificationColorOrange: '橙',
          addSpecificateItem: '新增規格項目',
          fillValue: '填入值',
          reset: '重設',
          submit: '送出',
          add: '新增',
          delete: '刪除',
          color: '顏色',
          normal: '正常',
          anomaly: '異常'
        },
        query: {
          title1: '查詢表單，預設展開',
          title2: '查詢表單，預設收合，收合時保留2列',
          appName: '應用程式名稱',
          appStatus: '應用程式狀態',
          createTime: '建立時間',
          responseDate: '回應日期',
          endDate: '結束日期',
          field: '欄位'
        },
        step: {
          title: '分步驟表單',
          step1: {
            title: '表單1',
            field: '表單1欄位',
            nextStep: '下一步'
          },
          step2: {
            title: '表單2',
            field: '表單2欄位',
            prevStep: '上一步',
            submit: '送出'
          }
        }
      },
      table: {
        remote: {
          filterCondition: '篩選條件',
          name: '名稱',
          createTime: '建立時間',
          responseTime: '回應時間',
          title: '遠端載入',
          replicableText: '可複製文字',
          tags: 'tags',
          dateFormatting: '日期格式化',
          image: '圖片'
        },
        rowEdit: {
          title: '編輯表格',
          reset: '重設',
          submit: '送出',
          edit: '編輯',
          delete: '刪除',
          save: '儲存',
          task: '任務',
          score: '評分',
          time: '時間',
          name: '名稱',
          action: '操作'
        }
      }
    },
    manage: {
      systemSettings: {
        group: {
          password: '密碼政策',
          session: '工作階段',
          ip: '來源 IP 登入設定',
          account: '帳號登入設定'
        },
        item: {
          password_min_length: { label: '密碼最小長度', help: '密碼最小長度' },
          password_max_length: { label: '密碼最大長度', help: '密碼最大長度' },
          password_require_lowercase: { label: '需含小寫字母', help: '需含小寫字母' },
          password_require_uppercase: { label: '需含大寫字母', help: '需含大寫字母' },
          password_require_digit: { label: '需含數字', help: '需含數字' },
          password_require_special: { label: '需含特殊符號', help: '需含特殊符號' },
          password_forbid_username: { label: '禁止密碼與帳號相同', help: '禁止密碼與帳號相同' },
          password_change_min_interval: {
            label: '密碼設定冷卻間隔（秒）',
            help: '同一操作者對同一帳號連續設定密碼的最小間隔（秒）；0＝停用'
          },
          single_session_default: { label: '單一工作階段（全站）', help: '全站單一工作階段之預設值' },
          session_idle_timeout: { label: '工作階段閒置逾時（分鐘）', help: '工作階段閒置逾時（分鐘）' },
          ip_window_minutes: {
            label: '來源 IP 登入失敗-計數時間窗（分鐘）',
            help: '來源節流：來源維度之滑動時間窗長度（分鐘）'
          },
          ip_max_fails: {
            label: '來源 IP 登入失敗-計數上限（次）',
            help: '來源節流：來源桶之滑動時間窗內失敗達此數即硬性鎖定（並行首波不嚴格）'
          },
          ip_captcha_after: {
            label: '來源 IP 登入失敗-觸發驗證碼（次）',
            help: '來源節流：來源桶之滑動時間窗內失敗達此數即進入驗證碼軟區（並行首波不嚴格）'
          },
          login_throttle_window_minutes: {
            label: '帳號登入失敗-計數時間窗（分鐘）',
            help: '登入節流：滑動時間窗長度（分鐘）＝鎖定的最長持續時間'
          },
          login_throttle_max_fails: {
            label: '帳號登入失敗-計數上限（次）',
            help: '登入節流：滑動時間窗內失敗達此數即鎖定（並行首波不嚴格）'
          },
          login_throttle_captcha_after: {
            label: '帳號登入失敗-觸發驗證碼（次）',
            help: '登入節流：滑動時間窗內失敗達此數即進入驗證碼軟區（並行首波不嚴格）'
          }
        },
        conflict: {
          password: '密碼最小長度大於最大長度：新增使用者、重設密碼與修改密碼將一律拒絕，請調整其中一項。',
          account: '帳號登入的觸發驗證碼門檻大於鎖定門檻：此組三項將整組退回出廠預設值。',
          ip: '來源 IP 登入的觸發驗證碼門檻大於鎖定門檻：此組三項將整組退回出廠預設值。'
        },
        readonlyTag: '唯讀'
      },
      common: {
        status: {
          enable: '啟用',
          disable: '停用'
        }
      },
      ipRule: {
        title: 'IP 規則清單',
        wbipCidr: '網段',
        wbipType: '規則類型',
        wbipMemo: '備註',
        order: '排序值',
        status: '狀態',
        createdAt: '建立時間',
        updatedAt: '更新時間',
        createdBy: '建立者',
        updatedBy: '更新者',
        statusActive: '生效中',
        statusDeleted: '已刪除',
        statusAll: '全部',
        addIpRule: '新增 IP 規則',
        editIpRule: '編輯 IP 規則',
        restore: '復原',
        confirmRestore: '確定復原此規則？',
        restoreSuccess: '復原成功',
        unlock: {
          title: '解鎖來源 IP',
          ipAddress: 'IP 位址',
          success: '已解除鎖定'
        },
        ruleTypeMap: {
          allow: '放行',
          deny: '阻擋'
        },
        form: {
          wbipCidr: '請輸入網段片段（模糊比對）',
          wbipType: '請選擇規則類型',
          status: '請選擇狀態',
          cidr: '請輸入網段，IPv4 或 IPv6（例如 192.168.1.0/24）',
          type: '請選擇規則類型',
          memo: '請輸入備註（選填）',
          order: '請輸入排序值（選填）'
        },
        empty: '—'
      },
      role: {
        title: '角色清單',
        roleName: '角色名稱',
        roleCode: '角色代碼',
        roleStatus: '角色狀態',
        roleDesc: '角色描述',
        roleMemo: '角色備註',
        menuAuth: '選單權限',
        buttonAuth: '按鈕權限',
        endpointAuth: '端點權限',
        form: {
          roleName: '請輸入角色名稱',
          roleCode: '請輸入角色代碼',
          roleStatus: '請選擇角色狀態',
          roleMemo: '請輸入角色備註（僅管理員可見）',
          roleDesc: '請輸入角色描述'
        },
        addRole: '新增角色',
        editRole: '編輯角色'
      },
      audit: {
        title: '稽核中心',
        tab: {
          operation: '操作日誌',
          access: '存取日誌',
          login: '登入嘗試',
          session: '工作階段事件'
        },
        search: {
          operatorId: '操作者 ID',
          operatorName: '操作者名稱',
          userId: '使用者 ID',
          timeRange: '時間區間',
          placeholder: {
            entityTable: '請輸入目標資料表',
            operation: '請輸入動作（如 update、kick）',
            operatorId: '請輸入操作者 ID',
            operatorName: '請輸入操作者名稱',
            httpMethod: '請輸入請求方法（如 GET）',
            httpStatus: '請輸入狀態碼',
            httpPath: '請輸入請求路徑（模糊比對）',
            attemptedUserName: '請輸入帳號名稱（模糊比對）',
            success: '請選擇結果',
            realIp: '請輸入來源 IP（精確比對）',
            userId: '請輸入使用者 ID',
            userName: '請輸入使用者名稱',
            eventType: '請輸入事件類型（如 kicked、idle）',
            reason: '請輸入原因',
            timeRange: '請選擇時間區間'
          }
        },
        column: {
          createTime: '時間',
          operator: '操作者',
          operation: '動作',
          entityTable: '目標資料表',
          entityId: '目標 ID',
          snapshot: '變更快照',
          realIp: '來源 IP',
          xForwardedFor: 'XFF 轉發鏈',
          region: '地區',
          traceId: '追蹤 ID',
          httpMethod: '請求方法',
          httpPath: '請求路徑',
          httpStatus: '狀態碼',
          attemptedUserName: '嘗試帳號',
          success: '結果',
          successOption: {
            true: '成功',
            false: '失敗'
          },
          user: '使用者',
          sid: '工作階段 ID',
          eventType: '事件類型',
          reason: '原因',
          sourceIp: '來源 IP'
        },
        snapshot: {
          entry: '檢視',
          title: '變更快照',
          before: '變更前',
          after: '變更後',
          empty: '（無快照）'
        },
        purge: {
          entry: '清理',
          title: '清理日誌：{table}',
          days: '保留天數',
          daysHint: '將刪除早於指定天數的紀錄；下限為 30 天。',
          warning: '此操作會永久刪除早於保留天數的紀錄且無法復原；清理動作本身會記入操作日誌。',
          confirm: '確定執行清理？此操作無法復原。',
          success: '清理完成，共刪除 {count} 筆紀錄'
        },
        notice: {
          access: '狀態欄為 HTTP 狀態碼：權限不足顯示 403，其餘請求（含業務拒絕與系統錯誤）皆顯示 200。',
          login: '被登入節流直接擋下的嘗試不會記錄於此；此處只列出實際判定成功或失敗的登入嘗試。'
        }
      },
      user: {
        title: '使用者清單',
        userName: '使用者名稱',
        userGender: '性別',
        nickName: '暱稱',
        userPhone: '手機號碼',
        userEmail: '信箱',
        userStatus: '使用者狀態',
        userRole: '使用者角色',
        password: '密碼',
        roles: '角色',
        roleSeparator: '、',
        sessionPolicy: '工作階段政策',
        userMemo: '備註',
        createdAt: '建立時間',
        createdBy: '建立者',
        updatedAt: '更新時間',
        updatedBy: '更新者',
        showDeleted: '顯示已刪除',
        restore: '復原',
        confirmRestore: '確定復原此使用者？',
        restoreHint: '復原後該使用者沒有任何角色，需重新指派',
        restoreSuccess: '復原成功',
        roleDisabledTag: '（已停用）',
        roleOptionsUnavailable: '角色候選讀取失敗，暫時無法調整角色指派；請關閉抽屜後重試。',
        sessionPolicyOption: {
          inherit: '跟隨全域設定',
          single: '單一裝置',
          multi: '多裝置'
        },
        sessionPolicyHint: '僅超級管理員可修改工作階段政策',
        passwordHint: '密碼規則由伺服器端驗證；可點選右側按鈕依目前政策隨機產生',
        kick: '踢除下線',
        confirmKick: '確定踢除該使用者的全部工作階段？',
        kickSuccess: '已踢除該使用者的全部工作階段',
        resetPwd: '重設密碼',
        resetPwdTitle: '重設密碼：{userName}',
        newPassword: '新密碼',
        resetPwdSuccess: '密碼已重設，該使用者的全部工作階段已失效',
        randomPassword: '隨機密碼',
        pwdGen: {
          title: '隨機產生密碼',
          length: '長度',
          generate: '重新產生',
          copy: '複製',
          copied: '已複製到剪貼簿',
          copyFailed: '複製失敗，請手動選取上方密碼複製',
          apply: '帶入'
        },
        unlockLogin: '解鎖登入',
        unlockLoginConfirm: '確定解除該使用者的登入鎖定？',
        unlockLoginSuccess: '已解除鎖定',
        form: {
          userName: '請輸入使用者名稱',
          userGender: '請選擇性別',
          nickName: '請輸入暱稱',
          userPhone: '請輸入手機號碼',
          userEmail: '請輸入信箱',
          userStatus: '請選擇使用者狀態',
          password: '請輸入密碼',
          userMemo: '請輸入備註（僅管理員可見）',
          userRole: '請選擇使用者角色'
        },
        addUser: '新增使用者',
        editUser: '編輯使用者',
        gender: {
          male: '男',
          female: '女'
        }
      },
      policyArchive: {
        title: '授權回收桶',
        sourceRole: '來源角色',
        dimension: '授權維度',
        target: '授權標的',
        archiveReason: '歸檔原因',
        archivedAt: '歸檔時間',
        archivedBy: '歸檔者',
        restore: '復原',
        confirmRestore: '確定復原此授權？',
        restoreSuccess: '復原成功',
        form: {
          sourceRole: '請輸入來源角色代碼',
          dimension: '請選擇授權維度'
        },
        dimensionLabel: {
          menu: '選單',
          button: '按鈕',
          endpoint: '端點'
        }
      },
      menu: {
        home: '首頁',
        title: '選單清單',
        id: 'ID',
        parentId: '父選單ID',
        menuType: '選單類型',
        menuName: '選單名稱',
        routeName: '路由名稱',
        routePath: '路由路徑',
        pathParam: '路徑參數',
        layout: '版面',
        page: '頁面元件',
        i18nKey: '國際化key',
        icon: '圖示',
        localIcon: '本機圖示',
        iconTypeTitle: '圖示類型',
        order: '排序',
        constant: '常數路由',
        keepAlive: '快取路由',
        href: '外部連結',
        hideInMenu: '隱藏選單',
        activeMenu: '醒目顯示的選單',
        multiTab: '支援多分頁',
        fixedIndexInTab: '固定在分頁中的序號',
        query: '路由參數',
        button: '按鈕',
        buttonCode: '按鈕代碼',
        buttonDesc: '按鈕描述',
        menuStatus: '選單狀態',
        menuMemo: '選單備註',
        showDeleted: '顯示已刪除',
        restore: '復原',
        confirmRestore: '確定復原此選單？',
        restoreSuccess: '復原成功',
        form: {
          home: '請選擇首頁',
          menuType: '請選擇選單類型',
          menuName: '請輸入選單名稱',
          routeName: '請輸入路由名稱',
          routePath: '請輸入路由路徑',
          pathParam: '請輸入路徑參數',
          page: '請選擇頁面元件',
          layout: '請選擇版面元件',
          i18nKey: '請輸入國際化key',
          icon: '請輸入圖示',
          localIcon: '請選擇本機圖示',
          order: '請輸入排序',
          keepAlive: '請選擇是否快取路由',
          href: '請輸入外部連結',
          hideInMenu: '請選擇是否隱藏選單',
          activeMenu: '請選擇醒目顯示選單的路由名稱',
          multiTab: '請選擇是否支援多分頁',
          fixedInTab: '請選擇是否固定在分頁中',
          fixedIndexInTab: '請輸入固定在分頁中的序號',
          queryKey: '請輸入路由參數Key',
          queryValue: '請輸入路由參數Value',
          button: '請選擇是否為按鈕',
          buttonCode: '請輸入按鈕代碼',
          buttonDesc: '請輸入按鈕描述',
          menuMemo: '請輸入選單備註（僅管理員可見）',
          parentRoot: '頂層（無父選單）',
          menuStatus: '請選擇選單狀態'
        },
        addMenu: '新增選單',
        editMenu: '編輯選單',
        addChildMenu: '新增子選單',
        type: {
          directory: '目錄',
          menu: '選單'
        },
        iconType: {
          iconify: 'iconify圖示',
          local: '本機圖示'
        }
      }
    }
  },
  form: {
    required: '不可為空',
    userName: {
      required: '請輸入使用者名稱',
      invalid: '使用者名稱格式不合法'
    },
    phone: {
      required: '請輸入手機號碼',
      invalid: '手機號碼格式不合法'
    },
    pwd: {
      required: '請輸入密碼',
      invalid: '密碼格式不合法，6-18個字元，包含字母、數字、底線'
    },
    confirmPwd: {
      required: '請輸入確認密碼',
      invalid: '兩次輸入的密碼不一致'
    },
    code: {
      required: '請輸入驗證碼',
      invalid: '驗證碼格式不合法'
    },
    email: {
      required: '請輸入信箱',
      invalid: '信箱格式不合法'
    }
  },
  dropdown: {
    closeCurrent: '關閉',
    closeOther: '關閉其他',
    closeLeft: '關閉左側',
    closeRight: '關閉右側',
    closeAll: '關閉全部',
    pin: '固定分頁',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主題設定',
    themeSchema: '主題模式',
    lang: '切換語言',
    fullscreen: '全螢幕',
    fullscreenExit: '離開全螢幕',
    reload: '重新整理頁面',
    collapse: '收合選單',
    expand: '展開選單',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 筆',
    fixed: {
      left: '左固定',
      right: '右固定',
      unFixed: '取消固定'
    }
  }
};

export default local;
