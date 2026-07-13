const local: App.I18n.Schema = {
  backend: {
    common: {
      success: '操作成功'
    },
    auth: {
      login: {
        failed: '使用者名稱或密碼錯誤',
        locked: '登入失敗次數過多，請稍後再試',
        captchaRequired: '請完成驗證碼後再試'
      },
      token: {
        expired: '登入已過期'
      },
      session: {
        reLogin: '請重新登入',
        kicked: '您的帳號已在他處登入'
      }
    },
    biz: {
      systemSettings: {
        notFound: '設定項不存在',
        invalidValue: '設定值無效'
      },
      auth: {
        notSupported: '該功能暫未開放'
      },
      // [rev4-inline I18N-WIRING(ii) 009-role-admin] biz.role/policy 治理拒因（distinct key；inUse 攜 {userCount} 插值、protectedRevoke 泛化訊息＋blocked 明細走呼叫端；ADR 0050）
      role: {
        seededProtected: '系統內建角色，不可刪除',
        inUse: '該角色掛有 {userCount} 個使用者，不可刪除',
        cannotDeleteSelfRole: '不能刪除目前登入使用者所屬的角色',
        cannotDisableSelfRole: '不能停用目前登入使用者所屬的角色',
        superCannotDisable: '超級管理員角色不可停用',
        codeImmutable: '角色編碼建立後不可修改',
        codeExists: '角色編碼已存在',
        codeInvalid: '角色編碼格式不正確（僅允許字母、數字、底線，最長 64 位）',
        notFound: '角色不存在',
        protectedRevoke: '存在受保護的授權，無法撤銷'
      },
      // [rev4-inline I18N-WIRING(ii) 010-menu-admin] biz.menu 治理拒因十鍵（一因一鍵、皆 scalar 無插值；data 明細走呼叫端渲染；R9／ADR 0050）
      menu: {
        protectedMenu: '系統內建選單，不可刪除',
        hasChildren: '選單下尚有子項，請先處理子項',
        routeNameImmutable: '路由名稱建立後不可修改',
        menuTypeImmutable: '選單類型建立後不可修改',
        routeNameExists: '路由名稱已存在',
        routeNameInvalid: '路由名稱格式不正確（僅允許字母、數字、底線、連字號，最長 100 位）',
        parentNotFound: '父層選單不存在',
        parentDeleted: '父層選單已刪除，請先復原父層',
        cycleDetected: '不可將選單移至自身或其子孫之下',
        notFound: '選單不存在'
      },
      policy: {
        notRestorable: '該歸檔授權不可復原'
      }
    },
    system: {
      forbidden: '沒有權限執行此操作'
    }
  },
  system: {
    title: 'Soybean 管理系統',
    updateTitle: '系統版本更新通知',
    updateContent: '偵測到系統有新版本發佈，是否立即重新整理頁面？',
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
    expandColumn: '展開列',
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
    reset: '重置',
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
    refreshToken: '請求的 token 已過期，更新 token',
    tokenExpired: 'token 已過期'
  },
  theme: {
    themeDrawerTitle: '主題設定',
    tabs: {
      appearance: '外觀',
      layout: '佈局',
      general: '通用',
      preset: '預設'
    },
    appearance: {
      themeSchema: {
        title: '主題模式',
        light: '亮色模式',
        dark: '暗黑模式',
        auto: '跟隨系統'
      },
      grayscale: '灰色模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主題顏色',
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
      recommendColor: '套用推薦演算法的顏色',
      recommendColorDesc: '推薦顏色的演算法參照',
      preset: {
        title: '主題預設',
        apply: '套用',
        applySuccess: '預設套用成功',
        default: {
          name: '預設配置',
          desc: 'Soybean 預設主題配置'
        },
        dark: {
          name: '暗色配置',
          desc: '適用於夜間使用的暗色主題配置'
        },
        compact: {
          name: '緊湊型',
          desc: '適用於小螢幕的緊湊佈局配置'
        },
        azir: {
          name: 'Azir 的配置',
          desc: '是 Azir 比較喜歡的莫蘭迪色系冷淡風'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '佈局模式',
        vertical: '左側選單模式',
        'vertical-mix': '左側選單混合模式',
        'vertical-hybrid-header-first': '左側混合-頂部優先',
        horizontal: '頂部選單模式',
        'top-hybrid-sidebar-first': '頂部混合-側邊優先',
        'top-hybrid-header-first': '頂部混合-頂部優先',
        vertical_detail: '左側選單佈局，選單在左，內容在右。',
        'vertical-mix_detail': '左側雙選單佈局，一級選單在左側深色區域，二級選單在左側淺色區域。',
        'vertical-hybrid-header-first_detail':
          '左側混合佈局，一級選單在頂部，二級選單在左側深色區域，三級選單在左側淺色區域。',
        horizontal_detail: '頂部選單佈局，選單在頂部，內容在下方。',
        'top-hybrid-sidebar-first_detail': '頂部混合佈局，一級選單在左側，二級選單在頂部。',
        'top-hybrid-header-first_detail': '頂部混合佈局，一級選單在頂部，二級選單在左側。'
      },
      tab: {
        title: '標籤列設定',
        visible: '顯示標籤列',
        cache: '標籤列資訊快取',
        cacheTip: '離開頁面後仍然保留標籤列資訊',
        height: '標籤列高度',
        mode: {
          title: '標籤列風格',
          slider: '滑塊風格',
          chrome: 'Chrome 風格',
          button: '按鈕風格'
        },
        closeByMiddleClick: '滑鼠中鍵關閉標籤頁',
        closeByMiddleClickTip: '啟用後可以使用滑鼠中鍵點擊標籤頁進行關閉'
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
        collapsedWidth: '側邊欄摺疊寬度',
        mixWidth: '混合佈局側邊欄寬度',
        mixCollapsedWidth: '混合佈局側邊欄摺疊寬度',
        mixChildMenuWidth: '混合佈局子選單寬度',
        autoSelectFirstMenu: '自動選擇第一個子選單',
        autoSelectFirstMenuTip: '點擊一級選單時，自動選擇並導覽至第一個子選單的最深層級'
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
          tip: '主題捲動僅 main 部分捲動，外層捲動可攜帶頁首頁尾一起捲動',
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
        fixedHeaderAndTab: '固定頁首和標籤列'
      }
    },
    general: {
      title: '通用設定',
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
      copySuccessMsg: '複製成功，請替換 src/theme/settings.ts 中的變數 themeSettings',
      resetConfig: '重置設定',
      resetSuccessMsg: '重置成功'
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
    'document_project-link': '專案文件（外部連結）',
    document_video: '影片教學',
    document_vue: 'Vue 文件',
    document_vite: 'Vite 文件',
    document_unocss: 'UnoCSS 文件',
    document_naive: 'Naive UI 文件',
    'document_pro-naive': 'Pro Naive UI 文件',
    document_antd: 'Ant Design Vue 文件',
    document_alova: 'Alova 文件',
    'user-center': '個人中心',
    about: '關於',
    function: '系統功能',
    alova: 'alova 範例',
    alova_request: 'alova 請求',
    alova_scenes: '場景化請求',
    'pro-naive': 'Pro Naive UI 範例',
    'pro-naive_form': '表單',
    'pro-naive_form_basic': '基礎表單',
    'pro-naive_form_query': '查詢表單',
    'pro-naive_form_step': '分步表單',
    'pro-naive_table': '表格',
    'pro-naive_table_remote': '遠端載入',
    'pro-naive_table_row-edit': '行編輯',
    function_tab: '標籤頁',
    'function_multi-tab': '多標籤頁',
    'function_hide-child': '隱藏子選單',
    'function_hide-child_one': '隱藏子選單',
    'function_hide-child_two': '選單二',
    'function_hide-child_three': '選單三',
    function_request: '請求',
    'function_toggle-auth': '切換權限',
    'function_super-page': '超級管理員可見',
    manage: '系統管理',
    manage_user: '使用者管理',
    'manage_user-detail': '使用者詳情',
    manage_role: '角色管理',
    manage_menu: '選單管理',
    'manage_system-settings': '系統設定',
    'manage_policy-archive': '授權回收桶',
    'multi-menu': '多級選單',
    'multi-menu_first': '選單一',
    'multi-menu_first_child': '選單一子選單',
    'multi-menu_second': '選單二',
    'multi-menu_second_child': '選單二子選單',
    'multi-menu_second_child_home': '選單二子選單首頁',
    exception: '異常頁',
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
        reGetCode: '{time} 秒後重新取得',
        sendCodeSuccess: '驗證碼傳送成功',
        imageCodePlaceholder: '請輸入圖片驗證碼'
      },
      register: {
        title: '註冊帳號',
        agreement: '我已經仔細閱讀並接受',
        protocol: '《使用者協議》',
        policy: '《隱私權政策》'
      },
      resetPwd: {
        title: '重置密碼'
      },
      bindWeChat: {
        title: '綁定微信'
      }
    },
    about: {
      title: '關於',
      introduction: `SoybeanAdmin 是一個優雅且功能強大的後台管理範本，基於最新的前端技術堆疊，包括 Vue3、Vite7、TypeScript、Pinia 和 UnoCSS。它內建了豐富的主題設定和元件，程式碼規範嚴謹，實現了自動化的檔案路由系統。此外，它還採用了基於 ApiFox 的線上 Mock 資料方案。SoybeanAdmin 為您提供了一站式的後台管理解決方案，無需額外設定，開箱即用。同樣是一個快速學習前沿技術的最佳實踐。`,
      projectInfo: {
        title: '專案資訊',
        version: '版本',
        latestBuildTime: '最新建置時間',
        githubLink: 'Github 網址',
        previewLink: '預覽網址'
      },
      prdDep: '生產相依套件',
      devDep: '開發相依套件'
    },
    home: {
      branchDesc:
        '為了方便大家開發和更新合併，我們對 main 分支的程式碼進行了精簡，只保留了首頁選單，其餘內容已移至 example 分支進行維護。預覽網址顯示的內容即為 example 分支的內容。',
      greeting: '早安，{userName}，今天又是充滿活力的一天！',
      weatherDesc: '今日多雲轉晴，20℃ - 25℃！',
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
        desc1: 'Soybean 在 2021 年 5 月 28 日建立了開源專案 soybean-admin！',
        desc2: 'Yanbowe 向 soybean-admin 提交了一個 bug，多標籤列不會自適應。',
        desc3: 'Soybean 準備為 soybean-admin 的發佈做充分的準備工作！',
        desc4: 'Soybean 正在忙於為 soybean-admin 撰寫專案說明文件！',
        desc5: 'Soybean 剛才把工作台頁面隨意寫了一些，勉強能看了！'
      },
      creativity: '創意'
    },
    function: {
      tab: {
        tabOperate: {
          title: '標籤頁操作',
          addTab: '新增標籤頁',
          addTabDesc: '跳轉至關於頁面',
          closeTab: '關閉標籤頁',
          closeCurrentTab: '關閉目前標籤頁',
          closeAboutTab: '關閉「關於」標籤頁',
          addMultiTab: '新增多標籤頁',
          addMultiTabDesc1: '跳轉至多標籤頁頁面',
          addMultiTabDesc2: '跳轉至多標籤頁頁面（帶有查詢參數）'
        },
        tabTitle: {
          title: '標籤頁標題',
          changeTitle: '修改標題',
          change: '修改',
          resetTitle: '重置標題',
          reset: '重置'
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
        visibilityRequestTips: '瀏覽器視窗切換自動請求資料',
        pollingRequestTips: '每 3 秒自動請求一次',
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
          appName: '應用名稱',
          appStatus: '應用狀態',
          createTime: '建立時間',
          responseDate: '回應日期',
          specificationInfo: '規格資訊',
          specificate: '規格',
          specificationName: '規格名稱',
          specificationValue: '規格值',
          specificationColorRed: '紅',
          specificationColorOrange: '橙',
          addSpecificateItem: '新增規格項',
          fillValue: '填入值',
          reset: '重置',
          submit: '提交',
          add: '新增',
          delete: '刪除',
          color: '顏色',
          normal: '正常',
          anomaly: '異常'
        },
        query: {
          title1: '查詢表單，預設展開',
          title2: '查詢表單，預設摺疊，摺疊時保留 2 行',
          appName: '應用名稱',
          appStatus: '應用狀態',
          createTime: '建立時間',
          responseDate: '回應日期',
          endDate: '結束日期',
          field: '欄位'
        },
        step: {
          title: '分步表單',
          step1: {
            title: '表單 1',
            field: '表單 1 欄位',
            nextStep: '下一步'
          },
          step2: {
            title: '表單 2',
            field: '表單 2 欄位',
            prevStep: '上一步',
            submit: '提交'
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
          tags: '標籤',
          dateFormatting: '日期格式化',
          image: '圖片'
        },
        rowEdit: {
          title: '編輯表格',
          reset: '重置',
          submit: '提交',
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
        passwordPolicyTitle: '密碼策略',
        sessionTitle: '工作階段設定',
        ipLoginTitle: 'IP源登入設定',
        accountLoginTitle: '帳號登入設定',
        items: {
          passwordMinLength: '密碼最小長度',
          passwordMaxLength: '密碼最大長度',
          passwordRequireLowercase: '需含小寫字母',
          passwordRequireUppercase: '需含大寫字母',
          passwordRequireDigit: '需含數字',
          passwordRequireSpecial: '需含特殊符號',
          passwordForbidUsername: '禁止密碼與帳號相同',
          singleSessionDefault: 'Session 單一在線（全站）',
          sessionIdleTimeout: 'Session 閒置逾時（分鐘）',
          ipMaxFails: 'IP源登入失敗-計數最大值（次）',
          ipWindowMinutes: 'IP源登入失敗-計數窗口（分鐘）',
          ipCaptchaAfter: 'IP源登入失敗-觸發驗證碼（次）',
          loginThrottleMaxFails: '帳號登入失敗-計數最大值（次）',
          loginThrottleWindowMinutes: '帳號登入失敗-計數窗口（分鐘）',
          loginThrottleCaptchaAfter: '帳號登入失敗-觸發驗證碼（次）'
        }
      },
      common: {
        status: {
          enable: '啟用',
          disable: '停用'
        }
      },
      role: {
        title: '角色列表',
        roleName: '角色名稱',
        roleCode: '角色編碼',
        roleStatus: '角色狀態',
        roleDesc: '角色描述',
        menuAuth: '選單權限',
        buttonAuth: '按鈕權限',
        // [rev4-inline MODAL-WIRING(c) 009-role-admin] endpoint-auth-modal net-new modal 自身 key（(c) 明文授權）
        endpointAuth: '端點權限',
        form: {
          roleName: '請輸入角色名稱',
          roleCode: '請輸入角色編碼',
          roleStatus: '請選擇角色狀態',
          roleDesc: '請輸入角色描述'
        },
        addRole: '新增角色',
        editRole: '編輯角色'
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
          sourceRole: '請輸入來源角色編碼',
          dimension: '請選擇授權維度'
        },
        dimensionLabel: {
          menu: '選單',
          button: '按鈕',
          endpoint: '端點'
        }
      },
      user: {
        title: '使用者列表',
        userName: '使用者名稱',
        userGender: '性別',
        nickName: '暱稱',
        userPhone: '手機號碼',
        userEmail: '電子郵件',
        userStatus: '使用者狀態',
        userRole: '使用者角色',
        form: {
          userName: '請輸入使用者名稱',
          userGender: '請選擇性別',
          nickName: '請輸入暱稱',
          userPhone: '請輸入手機號碼',
          userEmail: '請輸入電子郵件',
          userStatus: '請選擇使用者狀態',
          userRole: '請選擇使用者角色'
        },
        addUser: '新增使用者',
        editUser: '編輯使用者',
        gender: {
          male: '男',
          female: '女'
        }
      },
      menu: {
        home: '首頁',
        title: '選單列表',
        id: 'ID',
        parentId: '父級選單 ID',
        menuType: '選單類型',
        menuName: '選單名稱',
        routeName: '路由名稱',
        routePath: '路由路徑',
        pathParam: '路徑參數',
        layout: '佈局',
        page: '頁面元件',
        i18nKey: '國際化 key',
        icon: '圖示',
        localIcon: '本機圖示',
        iconTypeTitle: '圖示類型',
        order: '排序',
        constant: '常數路由',
        keepAlive: '快取路由',
        href: '外部連結',
        hideInMenu: '隱藏選單',
        activeMenu: '高亮的選單',
        multiTab: '支援多頁籤',
        fixedIndexInTab: '固定在頁籤中的序號',
        query: '路由參數',
        button: '按鈕',
        buttonCode: '按鈕編碼',
        buttonDesc: '按鈕描述',
        menuStatus: '選單狀態',
        form: {
          home: '請選擇首頁',
          menuType: '請選擇選單類型',
          menuName: '請輸入選單名稱',
          routeName: '請輸入路由名稱',
          routePath: '請輸入路由路徑',
          pathParam: '請輸入路徑參數',
          page: '請選擇頁面元件',
          layout: '請選擇佈局元件',
          i18nKey: '請輸入國際化 key',
          icon: '請輸入圖示',
          localIcon: '請選擇本機圖示',
          order: '請輸入排序',
          keepAlive: '請選擇是否快取路由',
          href: '請輸入外部連結',
          hideInMenu: '請選擇是否隱藏選單',
          activeMenu: '請選擇高亮選單的路由名稱',
          multiTab: '請選擇是否支援多標籤',
          fixedInTab: '請選擇是否固定在頁籤中',
          fixedIndexInTab: '請輸入固定在頁籤中的序號',
          queryKey: '請輸入路由參數 Key',
          queryValue: '請輸入路由參數 Value',
          button: '請選擇是否為按鈕',
          buttonCode: '請輸入按鈕編碼',
          buttonDesc: '請輸入按鈕描述',
          menuStatus: '請選擇選單狀態'
        },
        addMenu: '新增選單',
        editMenu: '編輯選單',
        addChildMenu: '新增子選單',
        // [rev4-inline (d) 010-menu-admin] 顯示已刪除 toggle＋復原確認（憲法 §III.2(d) 錨點；restore/restoreSuccess 復用 policyArchive entity-neutral）
        showDeleted: '顯示已刪除',
        confirmRestore: '確定復原此選單？',
        type: {
          directory: '目錄',
          menu: '選單'
        },
        iconType: {
          iconify: 'iconify 圖示',
          local: '本機圖示'
        }
      }
    }
  },
  form: {
    required: '不能為空',
    userName: {
      required: '請輸入使用者名稱',
      invalid: '使用者名稱格式不正確'
    },
    phone: {
      required: '請輸入手機號碼',
      invalid: '手機號碼格式不正確'
    },
    pwd: {
      required: '請輸入密碼',
      invalid: '密碼格式不正確，6-18 位字元，包含字母、數字、底線'
    },
    confirmPwd: {
      required: '請輸入確認密碼',
      invalid: '兩次輸入密碼不一致'
    },
    code: {
      required: '請輸入驗證碼',
      invalid: '驗證碼格式不正確'
    },
    email: {
      required: '請輸入電子郵件',
      invalid: '電子郵件格式不正確'
    }
  },
  dropdown: {
    closeCurrent: '關閉',
    closeOther: '關閉其他',
    closeLeft: '關閉左側',
    closeRight: '關閉右側',
    closeAll: '關閉全部',
    pin: '固定標籤',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主題設定',
    themeSchema: '主題模式',
    lang: '切換語言',
    fullscreen: '全螢幕',
    fullscreenExit: '退出全螢幕',
    reload: '重新整理頁面',
    collapse: '摺疊選單',
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
