const local: App.I18n.Schema = {
  // [rev5-inline BASE-WEB-I18N-WIRING(ii)+ 003-auth-session START] backend 命名空間（wire msg
  // key → 在地化顯示；**53 鍵**＝003-auth-session 之 22 鍵＋004-ip-trust-anchor 之
  // biz.ipRule.* 五鍵與 biz.throttle.* 一鍵＋005-role-menu-crud 之 biz.role.* 十鍵與
  // biz.menu.* 十二鍵＋006-authz-governance 之 biz.role.* 兩鍵與 biz.policy.* 一鍵；
  // 各刀新鍵的譯文單一權威＝該刀 contracts/msg-keys.md，
  // 其餘鍵照 rev4 鏡像重打字消化）。★下一行 `  backend: {` 須獨佔一行——傘狀 docs-sync 之
  // gen.msg_dict 解除謂詞與 parse_locale_backend 起點掃描對該行整行 fullmatch。
  backend: {
    common: {
      success: 'Operation successful',
      // 白名單鍵（後端恆不發）：明細清單在地化分隔符（translateDetailValue join 用）
      listSeparator: ', '
    },
    system: {
      internal: 'An internal error occurred. Please try again later',
      notFound: 'The requested resource was not found',
      forbidden: 'You do not have permission to perform this action'
    },
    auth: {
      login: {
        failed: 'Incorrect username or password'
      },
      session: {
        reLogin: 'Please log in again',
        kicked: 'Your account signed in elsewhere; this session ended'
      },
      token: {
        expired: 'Session expired, refreshing'
      }
    },
    biz: {
      auth: {
        notSupported: 'This feature is not available yet',
        captchaRequired: 'Please complete the captcha and try again',
        locked: 'Too many attempts; please try again later'
      },
      // 004-ip-trust-anchor T038 五鍵（譯文語意單一權威＝
      // specs/004-ip-trust-anchor/contracts/msg-keys.md）
      ipRule: {
        invalidRuleType: 'Invalid rule type',
        invalidCidr: 'Invalid network address format',
        conflict: 'A rule with the same network and type already exists',
        notFound: 'The rule was not found, or its state does not allow this action',
        selfLock: 'This rule would block your current connection; the change was rejected'
      },
      // 005-role-menu-crud T026 十一鍵＋T031 一鍵（鍵字面與譯文語意單一權威＝
      // specs/005-role-menu-crud/contracts/msg-keys.md；譯文照 rev4:en-us.ts biz.menu
      // 對應鍵消化、★parentNotFound 併鍵「不存在或已刪」——rev5 單鍵、rev4 兩鍵形不帶回；
      // constantParent／nameRequired／restoreConflict 為 rev5 新鍵、rev4 無對應
      // ——restoreConflict＝復原撞活性同鍵〔rev4 併 routeNameExists 形不帶回〕）
      menu: {
        notFound: 'Menu not found',
        routeNameExists: 'Route name already exists',
        routeNameImmutable: 'Route name cannot be changed after creation',
        menuTypeImmutable: 'Menu type cannot be changed after creation',
        parentNotFound: 'Parent menu does not exist or has been deleted',
        cycleDetected: 'A menu cannot be moved under itself or its descendants',
        hasChildren: 'This menu still has child items; please handle the child items first',
        protectedMenu: 'Protected menus cannot be deleted',
        constantParent: 'A constant menu can only be placed under a constant parent menu',
        nameRequired: 'Menu name must not be null',
        routeNameInvalid: 'Invalid route name (letters, digits, underscore and hyphen only, up to 100 characters)',
        restoreConflict: 'An active menu with the same route name already exists; cannot restore'
      },
      // 006-authz-governance T023 一鍵（鍵字面與譯文語意單一權威＝
      // specs/006-authz-governance/contracts/msg-keys.md；譯文照 rev4:en-us.ts
      // backend.biz.policy.notRestorable 同鍵消化）
      policy: {
        notRestorable: 'This archived policy cannot be restored'
      },
      // 005-role-menu-crud T020 九鍵（鍵字面與譯文語意單一權威＝
      // specs/005-role-menu-crud/contracts/msg-keys.md；譯文照 rev4:en-us.ts biz.role
      // 對應鍵消化、★inUse 攜參形不帶回——rev5 純 key 零插值〔R2-9〕）
      role: {
        codeInvalid: 'Invalid role code (letters, digits and underscore only, up to 64 characters)',
        codeExists: 'The role code already exists',
        codeImmutable: 'The role code cannot be changed after creation',
        notFound: 'The role was not found',
        seededProtected: 'Built-in system roles cannot be deleted',
        inUse: 'The role still has users assigned and cannot be deleted',
        cannotDeleteSelfRole: 'You cannot delete a role assigned to your own account',
        cannotDisableSelfRole: 'You cannot disable a role assigned to your own account',
        superCannotDisable: 'The super administrator role cannot be disabled',
        nameRequired: 'Role name must not be null',
        protectedRevoke: 'Protected policies cannot be revoked',
        protectedGrant: 'Protected endpoints are reserved for the super administrator'
      },
      systemSettings: {
        invalidValue: 'Invalid setting value (wrong type, out of range or not an allowed option)',
        notFound: 'The specified setting key was not found'
      },
      // 004-ip-trust-anchor T054 一鍵（譯文語意單一權威＝
      // specs/004-ip-trust-anchor/contracts/msg-keys.md）
      throttle: {
        invalidUnlockTarget: 'Invalid unlock target'
      },
      // 白名單八鍵（後端恆不發）：密碼政策違規碼逐碼譯文（translateDetailValue 消費）
      user: {
        passwordViolation: {
          minLength: 'length below the policy minimum',
          maxLength: 'length exceeds the policy maximum',
          maxBytes: 'byte length exceeds the limit',
          requireDigit: 'must contain a digit',
          requireLowercase: 'must contain a lowercase letter',
          requireUppercase: 'must contain an uppercase letter',
          requireSpecial: 'must contain a special character',
          forbidUsername: 'must not be identical to the user name'
        }
      }
    }
  },
  // [rev5-inline BASE-WEB-I18N-WIRING(ii)+ 003-auth-session END]
  system: {
    title: 'SoybeanAdmin',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to home',
    batchDelete: 'Batch Delete',
    cancel: 'Cancel',
    close: 'Close',
    check: 'Check',
    selectAll: 'Select All',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    confirm: 'Confirm',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    updateSuccess: 'Update Success',
    userCenter: 'User Center',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    }
  },
  request: {
    logout: 'Logout user after request failed',
    logoutMsg: 'User status is invalid, please log in again',
    logoutWithModal: 'Pop up modal after request failed and then log out user',
    logoutWithModalMsg: 'User status is invalid, please log in again',
    refreshToken: 'The requested token has expired, refresh the token',
    tokenExpired: 'The requested token has expired'
  },
  theme: {
    themeDrawerTitle: 'Theme Configuration',
    tabs: {
      appearance: 'Appearance',
      layout: 'Layout',
      general: 'General',
      preset: 'Preset'
    },
    appearance: {
      themeSchema: {
        title: 'Theme Schema',
        light: 'Light',
        dark: 'Dark',
        auto: 'Follow System'
      },
      grayscale: 'Grayscale',
      colourWeakness: 'Colour Weakness',
      themeColor: {
        title: 'Theme Color',
        primary: 'Primary',
        info: 'Info',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        followPrimary: 'Follow Primary'
      },
      themeRadius: {
        title: 'Theme Radius'
      },
      recommendColor: 'Apply Recommended Color Algorithm',
      recommendColorDesc: 'The recommended color algorithm refers to',
      preset: {
        title: 'Theme Presets',
        apply: 'Apply',
        applySuccess: 'Preset applied successfully',
        default: {
          name: 'Default Preset',
          desc: 'Default theme preset with balanced settings'
        },
        dark: {
          name: 'Dark Preset',
          desc: 'Dark theme preset for night time usage'
        },
        compact: {
          name: 'Compact Preset',
          desc: 'Compact layout preset for small screens'
        },
        azir: {
          name: "Azir's Preset",
          desc: 'It is a cold and elegant preset that Azir likes'
        }
      }
    },
    layout: {
      layoutMode: {
        title: 'Layout Mode',
        vertical: 'Vertical Mode',
        horizontal: 'Horizontal Mode',
        'vertical-mix': 'Vertical Mix Mode',
        'vertical-hybrid-header-first': 'Left Hybrid Header-First',
        'top-hybrid-sidebar-first': 'Top-Hybrid Sidebar-First',
        'top-hybrid-header-first': 'Top-Hybrid Header-First',
        vertical_detail: 'Vertical menu layout, with the menu on the left and content on the right.',
        'vertical-mix_detail':
          'Vertical mix-menu layout, with the primary menu on the dark left side and the secondary menu on the lighter left side.',
        'vertical-hybrid-header-first_detail':
          'Left hybrid layout, with the primary menu at the top, the secondary menu on the dark left side, and the tertiary menu on the lighter left side.',
        horizontal_detail: 'Horizontal menu layout, with the menu at the top and content below.',
        'top-hybrid-sidebar-first_detail':
          'Top hybrid layout, with the primary menu on the left and the secondary menu at the top.',
        'top-hybrid-header-first_detail':
          'Top hybrid layout, with the primary menu at the top and the secondary menu on the left.'
      },
      tab: {
        title: 'Tab Settings',
        visible: 'Tab Visible',
        cache: 'Tag Bar Info Cache',
        cacheTip: 'Keep the tab bar information after leaving the page',
        height: 'Tab Height',
        mode: {
          title: 'Tab Mode',
          slider: 'Slider',
          chrome: 'Chrome',
          button: 'Button'
        },
        closeByMiddleClick: 'Close Tab by Middle Click',
        closeByMiddleClickTip: 'Enable closing tabs by clicking with the middle mouse button'
      },
      header: {
        title: 'Header Settings',
        height: 'Header Height',
        breadcrumb: {
          visible: 'Breadcrumb Visible',
          showIcon: 'Breadcrumb Icon Visible'
        }
      },
      sider: {
        title: 'Sider Settings',
        inverted: 'Dark Sider',
        width: 'Sider Width',
        collapsedWidth: 'Sider Collapsed Width',
        mixWidth: 'Mix Sider Width',
        mixCollapsedWidth: 'Mix Sider Collapse Width',
        mixChildMenuWidth: 'Mix Child Menu Width',
        autoSelectFirstMenu: 'Auto Select First Submenu',
        autoSelectFirstMenuTip:
          'When a first-level menu is clicked, the first submenu is automatically selected and navigated to the deepest level'
      },
      footer: {
        title: 'Footer Settings',
        visible: 'Footer Visible',
        fixed: 'Fixed Footer',
        height: 'Footer Height',
        right: 'Right Footer'
      },
      content: {
        title: 'Content Area Settings',
        scrollMode: {
          title: 'Scroll Mode',
          tip: 'The theme scroll only scrolls the main part, the outer scroll can carry the header and footer together',
          wrapper: 'Wrapper',
          content: 'Content'
        },
        page: {
          animate: 'Page Animate',
          mode: {
            title: 'Page Animate Mode',
            fade: 'Fade',
            'fade-slide': 'Slide',
            'fade-bottom': 'Fade Zoom',
            'fade-scale': 'Fade Scale',
            'zoom-fade': 'Zoom Fade',
            'zoom-out': 'Zoom Out',
            none: 'None'
          }
        },
        fixedHeaderAndTab: 'Fixed Header And Tab'
      }
    },
    general: {
      title: 'General Settings',
      watermark: {
        title: 'Watermark Settings',
        visible: 'Watermark Full Screen Visible',
        text: 'Custom Watermark Text',
        enableUserName: 'Enable User Name Watermark',
        enableTime: 'Show Current Time',
        timeFormat: 'Time Format'
      },
      multilingual: {
        title: 'Multilingual Settings',
        visible: 'Display multilingual button'
      },
      globalSearch: {
        title: 'Global Search Settings',
        visible: 'Display GlobalSearch button'
      }
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    }
  },
  route: {
    login: 'Login',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
    'iframe-page': 'Iframe',
    home: 'Home',
    document: 'Document',
    document_project: 'Project Document',
    'document_project-link': 'Project Document(External Link)',
    document_video: 'Video Tutorial',
    document_vue: 'Vue Document',
    document_vite: 'Vite Document',
    document_unocss: 'UnoCSS Document',
    document_naive: 'Naive UI Document',
    'document_pro-naive': 'Pro Naive UI Document',
    document_antd: 'Ant Design Vue Document',
    document_alova: 'Alova Document',
    'user-center': 'User Center',
    about: 'About',
    function: 'System Function',
    alova: 'Alova Example',
    alova_request: 'Alova Request',
    alova_scenes: 'Scenario Request',
    'pro-naive': 'Pro Naive Example',
    'pro-naive_form': 'Form',
    'pro-naive_form_basic': 'Basic Form',
    'pro-naive_form_query': 'Query Form',
    'pro-naive_form_step': 'Step Form',
    'pro-naive_table': 'Table',
    'pro-naive_table_remote': 'Remote',
    'pro-naive_table_row-edit': 'Row Edit',
    function_tab: 'Tab',
    'function_multi-tab': 'Multi Tab',
    'function_hide-child': 'Hide Child',
    'function_hide-child_one': 'Hide Child',
    'function_hide-child_two': 'Two',
    'function_hide-child_three': 'Three',
    function_request: 'Request',
    'function_toggle-auth': 'Toggle Auth',
    'function_super-page': 'Super Admin Visible',
    manage: 'System Manage',
    manage_user: 'User Manage',
    'manage_user-detail': 'User Detail',
    manage_role: 'Role Manage',
    manage_menu: 'Menu Manage',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] route: 樹補
    // `manage_ip-rule` 一鍵——本樹型為 `Record<I18nRouteKey, string>`，路由外掛重算出該
    // RouteKey 後不補鍵即型別檢查紅（鍵名＝seed 選單列的 route_name，逐字不可改）。
    'manage_ip-rule': 'IP Rule Manage',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] route: 樹補
    // `manage_policy-archive` 一鍵（鍵名＝seed 選單列 10 的 route_name，逐字不可改；
    // 路由外掛重算出該 RouteKey 後不補鍵即型別檢查紅——同 (i) 用途的既有論證）。
    'manage_policy-archive': 'Policy Recycle Bin',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
    'multi-menu': 'Multi Menu',
    'multi-menu_first': 'Menu One',
    'multi-menu_first_child': 'Menu One Child',
    'multi-menu_second': 'Menu Two',
    'multi-menu_second_child': 'Menu Two Child',
    'multi-menu_second_child_home': 'Menu Two Child Home',
    exception: 'Exception',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    plugin: 'Plugin',
    plugin_copy: 'Copy',
    plugin_charts: 'Charts',
    plugin_charts_echarts: 'ECharts',
    plugin_charts_antv: 'AntV',
    plugin_charts_vchart: 'VChart',
    plugin_editor: 'Editor',
    plugin_editor_quill: 'Quill',
    plugin_editor_markdown: 'Markdown',
    plugin_icon: 'Icon',
    plugin_map: 'Map',
    plugin_print: 'Print',
    plugin_swiper: 'Swiper',
    plugin_video: 'Video',
    plugin_barcode: 'Barcode',
    plugin_pinyin: 'pinyin',
    plugin_excel: 'Excel',
    plugin_pdf: 'PDF preview',
    plugin_gantt: 'Gantt Chart',
    plugin_gantt_dhtmlx: 'dhtmlxGantt',
    plugin_gantt_vtable: 'VTableGantt',
    plugin_typeit: 'Typeit',
    plugin_tables: 'Tables',
    plugin_tables_vtable: 'VTable'
  },
  page: {
    login: {
      common: {
        loginOrRegister: 'Login / Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        back: 'Back',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !'
      },
      pwdLogin: {
        title: 'Password Login',
        rememberMe: 'Remember me',
        forgetPassword: 'Forget password?',
        register: 'Register',
        otherAccountLogin: 'Other Account Login',
        otherLoginMode: 'Other Login Mode',
        superAdmin: 'Super Admin',
        admin: 'Admin',
        user: 'User'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get verification code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Register',
        agreement: 'I have read and agree to',
        protocol: '《User Agreement》',
        policy: '《Privacy Policy》'
      },
      resetPwd: {
        title: 'Reset Password'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      }
    },
    about: {
      title: 'About',
      introduction: `SoybeanAdmin is an elegant and powerful admin template, based on the latest front-end technology stack, including Vue3, Vite7, TypeScript, Pinia and UnoCSS. It has built-in rich theme configuration and components, strict code specifications, and an automated file routing system. In addition, it also uses the online mock data solution based on ApiFox. SoybeanAdmin provides you with a one-stop admin solution, no additional configuration, and out of the box. It is also a best practice for learning cutting-edge technologies quickly.`,
      projectInfo: {
        title: 'Project Info',
        version: 'Version',
        latestBuildTime: 'Latest Build Time',
        githubLink: 'Github Link',
        previewLink: 'Preview Link'
      },
      prdDep: 'Production Dependency',
      devDep: 'Development Dependency'
    },
    home: {
      branchDesc:
        'For the convenience of everyone in developing and updating the merge, we have streamlined the code of the main branch, only retaining the homepage menu, and the rest of the content has been moved to the example branch for maintenance. The preview address displays the content of the example branch.',
      greeting: 'Good morning, {userName}, today is another day full of vitality!',
      weatherDesc: 'Today is cloudy to clear, 20℃ - 25℃!',
      projectCount: 'Project Count',
      todo: 'Todo',
      message: 'Message',
      downloadCount: 'Download Count',
      registerCount: 'Register Count',
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      visitCount: 'Visit Count',
      turnover: 'Turnover',
      dealCount: 'Deal Count',
      projectNews: {
        title: 'Project News',
        moreNews: 'More News',
        desc1: 'Soybean created the open source project soybean-admin on May 28, 2021!',
        desc2: 'Yanbowe submitted a bug to soybean-admin, the multi-tab bar will not adapt.',
        desc3: 'Soybean is ready to do sufficient preparation for the release of soybean-admin!',
        desc4: 'Soybean is busy writing project documentation for soybean-admin!',
        desc5: 'Soybean just wrote some of the workbench pages casually, and it was enough to see!'
      },
      creativity: 'Creativity'
    },
    function: {
      tab: {
        tabOperate: {
          title: 'Tab Operation',
          addTab: 'Add Tab',
          addTabDesc: 'To about page',
          closeTab: 'Close Tab',
          closeCurrentTab: 'Close Current Tab',
          closeAboutTab: 'Close "About" Tab',
          addMultiTab: 'Add Multi Tab',
          addMultiTabDesc1: 'To MultiTab page',
          addMultiTabDesc2: 'To MultiTab page(with query params)'
        },
        tabTitle: {
          title: 'Tab Title',
          changeTitle: 'Change Title',
          change: 'Change',
          resetTitle: 'Reset Title',
          reset: 'Reset'
        }
      },
      multiTab: {
        routeParam: 'Route Param',
        backTab: 'Back function_tab'
      },
      toggleAuth: {
        toggleAccount: 'Toggle Account',
        authHook: 'Auth Hook Function `hasAuth`',
        superAdminVisible: 'Super Admin Visible',
        adminVisible: 'Admin Visible',
        adminOrUserVisible: 'Admin and User Visible'
      },
      request: {
        repeatedErrorOccurOnce: 'Repeated Request Error Occurs Once',
        repeatedError: 'Repeated Request Error',
        repeatedErrorMsg1: 'Custom Request Error 1',
        repeatedErrorMsg2: 'Custom Request Error 2'
      }
    },
    alova: {
      scenes: {
        captchaSend: 'Captcha Send',
        autoRequest: 'Auto Request',
        visibilityRequestTips: 'Automatically request when switching browser window',
        pollingRequestTips: 'It will request every 3 seconds',
        networkRequestTips: 'Automatically request after network reconnecting',
        refreshTime: 'Refresh Time',
        startRequest: 'Start Request',
        stopRequest: 'Stop Request',
        requestCrossComponent: 'Request Cross Component',
        triggerAllRequest: 'Manually Trigger All Automated Requests'
      }
    },
    proNaive: {
      form: {
        basic: {
          title: 'Basic Example',
          appName: 'ApplicationName',
          appStatus: 'ApplicationStatus',
          createTime: 'CreateTime',
          responseDate: 'ResponseDate',
          specificationInfo: 'SpecificationInfo',
          specificate: 'Specificate',
          specificationName: 'SpecificationName',
          specificationValue: 'SpecificationValue',
          specificationColorRed: 'Red',
          specificationColorOrange: 'Orange',
          addSpecificateItem: 'Add Specificate Item',
          fillValue: 'FillValue',
          reset: 'Reset',
          submit: 'Submit',
          add: 'Add',
          delete: 'Delete',
          color: 'Color',
          normal: 'Normal',
          anomaly: 'Anomaly'
        },
        query: {
          title1: 'Query Example, which expands by default',
          title2: 'Query Example, which fold by default, and two lines are retained when folding',
          appName: 'ApplicationName',
          appStatus: 'ApplicationStatus',
          createTime: 'CreateTime',
          responseDate: 'ResponseDate',
          endDate: 'EndDate',
          field: 'Field'
        },
        step: {
          title: 'Step Form',
          step1: {
            title: 'Form 1',
            field: 'Form 1 field',
            nextStep: 'Next Step'
          },
          step2: {
            title: 'Form 2',
            field: 'Form 2 field',
            prevStep: 'Prev Step',
            submit: 'Submit'
          }
        }
      },
      table: {
        remote: {
          filterCondition: 'Filter Condition',
          name: 'Name',
          createTime: 'CreateTime',
          responseTime: 'ResponseTime',
          title: 'Remote Loading',
          replicableText: 'Replicable Text',
          tags: 'Tags',
          dateFormatting: 'Date Formatting',
          image: 'Image'
        },
        rowEdit: {
          title: 'Edit Table',
          reset: 'Reset',
          submit: 'Submit',
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save',
          task: 'Task',
          score: 'Score',
          time: 'Time',
          name: 'Name',
          action: 'Action'
        }
      }
    },
    manage: {
      common: {
        status: {
          enable: 'Enable',
          disable: 'Disable'
        }
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] page: 樹補
      // `manage.ipRule` 節（IP 規則管理頁文案）——★兩語鍵集 MUST 相等，型節見 typings/app.d.ts。
      // ★`order` 語彙一律「排序值」、絕不用「優先序」：規則集是 any-match 集合、該欄不參與判定
      // （憲法 §I.7 島 F 之 F1）；文案暗示優先序會讓使用者以為排前面的規則先生效。
      ipRule: {
        title: 'IP Rule List',
        wbipCidr: 'CIDR',
        wbipType: 'Rule Type',
        wbipMemo: 'Memo',
        order: 'Display Order',
        status: 'Status',
        createdAt: 'Created At',
        updatedAt: 'Updated At',
        createdBy: 'Created By',
        updatedBy: 'Updated By',
        statusActive: 'Active',
        statusDeleted: 'Deleted',
        statusAll: 'All',
        addIpRule: 'Add IP Rule',
        editIpRule: 'Edit IP Rule',
        restore: 'Restore',
        confirmRestore: 'Restore this rule?',
        restoreSuccess: 'Restored',
        ruleTypeMap: {
          allow: 'Allow',
          deny: 'Deny'
        },
        form: {
          wbipCidr: 'CIDR fragment (fuzzy match)',
          wbipType: 'Select a rule type',
          status: 'Select a status',
          cidr: 'CIDR, IPv4 or IPv6 (e.g. 192.168.1.0/24)',
          type: 'Select a rule type',
          memo: 'Memo (optional)',
          order: 'Display order (optional)'
        },
        empty: '—'
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleCode: 'Role Code',
        roleStatus: 'Role Status',
        roleDesc: 'Role Description',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] page: 樹補
        // `manage.role.roleMemo` 欄標籤鍵（FR-043 memo 欄；★兩語鍵集 MUST 相等，型節見 typings/app.d.ts）
        roleMemo: 'Role Memo',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        menuAuth: 'Menu Auth',
        buttonAuth: 'Button Auth',
        form: {
          roleName: 'Please enter role name',
          roleCode: 'Please enter role code',
          roleStatus: 'Please select role status',
          roleDesc: 'Please enter role description',
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] memo placeholder
          // （★逐字註明僅管理員可見＝FR-043）
          roleMemo: 'Role memo (visible to administrators only)'
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        },
        addRole: 'Add Role',
        editRole: 'Edit Role'
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] page: 樹補
      // `manage.policyArchive` 節（授權回收桶頁文案、15 葉鍵；contracts/msg-keys.md 逐字）——
      // ★兩語鍵集 MUST 相等，型節見 typings/app.d.ts。`archiveReason` 欄顯示原字面、本節不設映譯鍵。
      policyArchive: {
        title: 'Policy Recycle Bin',
        sourceRole: 'Source Role',
        dimension: 'Dimension',
        target: 'Target',
        archiveReason: 'Archive Reason',
        archivedAt: 'Archived At',
        archivedBy: 'Archived By',
        restore: 'Restore',
        confirmRestore: 'Confirm to restore this policy?',
        restoreSuccess: 'Restore success',
        form: {
          sourceRole: 'Please enter source role code',
          dimension: 'Please select dimension'
        },
        dimensionLabel: {
          menu: 'Menu',
          button: 'Button',
          endpoint: 'Endpoint'
        }
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
      user: {
        title: 'User List',
        userName: 'User Name',
        userGender: 'Gender',
        nickName: 'Nick Name',
        userPhone: 'Phone Number',
        userEmail: 'Email',
        userStatus: 'User Status',
        userRole: 'User Role',
        form: {
          userName: 'Please enter user name',
          userGender: 'Please select gender',
          nickName: 'Please enter nick name',
          userPhone: 'Please enter phone number',
          userEmail: 'Please enter email',
          userStatus: 'Please select user status',
          userRole: 'Please select user role'
        },
        addUser: 'Add User',
        editUser: 'Edit User',
        gender: {
          male: 'Male',
          female: 'Female'
        }
      },
      menu: {
        home: 'Home',
        title: 'Menu List',
        id: 'ID',
        parentId: 'Parent ID',
        menuType: 'Menu Type',
        menuName: 'Menu Name',
        routeName: 'Route Name',
        routePath: 'Route Path',
        pathParam: 'Path Param',
        layout: 'Layout Component',
        page: 'Page Component',
        i18nKey: 'I18n Key',
        icon: 'Icon',
        localIcon: 'Local Icon',
        iconTypeTitle: 'Icon Type',
        order: 'Order',
        constant: 'Constant',
        keepAlive: 'Keep Alive',
        href: 'Href',
        hideInMenu: 'Hide In Menu',
        activeMenu: 'Active Menu',
        multiTab: 'Multi Tab',
        fixedIndexInTab: 'Fixed Index In Tab',
        query: 'Query Params',
        button: 'Button',
        buttonCode: 'Button Code',
        buttonDesc: 'Button Desc',
        menuStatus: 'Menu Status',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] page: 樹補
        // `manage.menu.menuMemo` 欄標籤鍵（FR-043 memo 欄）＋回收桶 toggle 四鍵（U12——
        // showDeleted/confirmRestore＝msg-keys 前端補鍵段既列、restore/restoreSuccess＝
        // 復原鈕標籤與成功 toast 頁自有鍵；★兩語鍵集 MUST 相等，型節見 typings/app.d.ts）
        menuMemo: 'Menu Memo',
        showDeleted: 'Show Deleted',
        restore: 'Restore',
        confirmRestore: 'Restore this menu?',
        restoreSuccess: 'Restored',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        form: {
          home: 'Please select home',
          menuType: 'Please select menu type',
          menuName: 'Please enter menu name',
          routeName: 'Please enter route name',
          routePath: 'Please enter route path',
          pathParam: 'Please enter path param',
          page: 'Please select page component',
          layout: 'Please select layout component',
          i18nKey: 'Please enter i18n key',
          icon: 'Please enter iconify name',
          localIcon: 'Please enter local icon name',
          order: 'Please enter order',
          keepAlive: 'Please select whether to cache route',
          href: 'Please enter href',
          hideInMenu: 'Please select whether to hide menu',
          activeMenu: 'Please select route name of the highlighted menu',
          multiTab: 'Please select whether to support multiple tabs',
          fixedInTab: 'Please select whether to fix in the tab',
          fixedIndexInTab: 'Please enter the index fixed in the tab',
          queryKey: 'Please enter route parameter Key',
          queryValue: 'Please enter route parameter Value',
          button: 'Please select whether it is a button',
          buttonCode: 'Please enter button code',
          buttonDesc: 'Please enter button description',
          menuStatus: 'Please select menu status',
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] memo placeholder
          // （★逐字註明僅管理員可見＝FR-043）＋父選擇器「頂層」合成選項標籤（parentId=0 提交入口）
          menuMemo: 'Menu memo (visible to administrators only)',
          parentRoot: 'Top level (no parent)'
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        },
        addMenu: 'Add Menu',
        editMenu: 'Edit Menu',
        addChildMenu: 'Add Child Menu',
        type: {
          directory: 'Directory',
          menu: 'Menu'
        },
        iconType: {
          iconify: 'Iconify Icon',
          local: 'Local Icon'
        }
      }
    }
  },
  form: {
    required: 'Cannot be empty',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: '6-18 characters, including letters, numbers, and underscores'
    },
    confirmPwd: {
      required: 'Please enter password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All',
    pin: 'Pin Tab',
    unpin: 'Unpin Tab'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin'
  },
  datatable: {
    itemCount: 'Total {total} items',
    fixed: {
      left: 'Left Fixed',
      right: 'Right Fixed',
      unFixed: 'Unfixed'
    }
  }
};

export default local;
