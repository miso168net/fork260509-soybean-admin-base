const local: App.I18n.Schema = {
  // [rev6-inline BASE-WEB-I18N-WIRING(ii)+ 003-auth-session START] backend 樹（本子樹即 en-US 譯文的權威＝ADR-00084；鍵集與鍵數以跨端閘 `python3 tools/msg-key-gate.py check` 對賬為準；首批鍵的史料出處＝`specs/003-auth-session/contracts/msg-keys.md`；★下一行 backend: { 須獨佔一行＝跨端閘右源錨）
  backend: {
    common: { success: 'Operation successful' },
    system: {
      internal: 'An internal error occurred. Please try again later',
      notFound: 'The requested resource was not found',
      forbidden: 'You do not have permission to perform this action'
    },
    auth: {
      login: { failed: 'Incorrect username or password' },
      session: {
        reLogin: 'Please log in again',
        kicked: 'Your account signed in elsewhere; this session ended',
        kickedByAdmin: 'This session was ended by an administrator, please sign in again'
      },
      token: { expired: 'Session expired, refreshing' }
    },
    biz: {
      systemSettings: {
        invalidValue: 'Invalid setting value (wrong type, out of range or not an allowed option)',
        notFound: 'The specified setting key was not found'
      },
      auth: {
        notSupported: 'This feature is not available yet',
        captchaRequired: 'Please complete the captcha and try again',
        locked: 'Too many attempts; please try again later'
      },
      ipRule: {
        invalidRuleType: 'Invalid rule type',
        invalidCidr: 'Invalid network address format',
        conflict: 'A rule with the same network and type already exists',
        notFound: 'The rule was not found, or its state does not allow this action',
        selfLock: 'This change would block your current connection and was rejected'
      },
      throttle: { invalidUnlockTarget: 'Invalid unlock target' },
      role: {
        codeInvalid: 'Invalid role code (letters, digits and underscore only, up to 64 characters)',
        codeExists: 'The role code already exists',
        codeImmutable: 'The role code cannot be changed after creation',
        notFound: 'The role was not found',
        seededProtected: 'Built-in system roles cannot be deleted',
        inUse: 'This role is still assigned to user accounts (disabled or deleted ones included) and cannot be deleted',
        cannotDeleteSelfRole: 'You cannot delete a role assigned to your own account',
        cannotDisableSelfRole: 'You cannot disable a role assigned to your own account',
        superCannotDisable: 'The super administrator role cannot be disabled',
        nameRequired: 'Role name is required and cannot be empty',
        protectedRevoke: 'Protected policies cannot be revoked',
        protectedGrant: 'Protected endpoints are reserved for the super administrator'
      },
      menu: {
        notFound: 'The menu was not found, or its state does not allow this action',
        routeNameExists: 'This route name is already used by an existing menu or is reserved by the system',
        routeNameImmutable: 'Route name cannot be changed after creation',
        menuTypeImmutable: 'Menu type cannot be changed after creation',
        parentNotFound: 'Parent menu does not exist or has been deleted',
        cycleDetected: 'A menu cannot be moved under itself or its descendants',
        protectedMenu: 'A protected menu cannot be deleted, disabled or moved under a different parent menu',
        constantParent:
          'A constant menu can only be placed under constant parent menus; a menu with constant descendants cannot stop being constant',
        nameRequired: 'Menu name is required and cannot be empty',
        routeNameInvalid: 'Invalid route name (letters, digits, underscore and hyphen only, up to 100 characters)',
        hrefInvalid: 'The external link must start with http:// or https://',
        buttonsInvalid: 'Invalid button list: every button needs a non-empty, unique code of up to 100 characters',
        hasChildren: 'This menu still has child menus (including disabled ones); handle its child menus first',
        restoreConflict: 'An active menu with the same route name already exists; cannot restore',
        protectedButtonRemove: 'Button codes that still have protected policies cannot be removed or changed'
      },
      policy: {
        notRestorable: 'This archived policy cannot be restored'
      },
      user: {
        notFound: 'User not found',
        userNameInvalid: 'Invalid username format',
        userNameExists: 'Username already exists',
        userNameImmutable: 'Username cannot be changed',
        userEmailInvalid: 'Invalid email format',
        userEmailExists: 'Email already in use',
        roleNotFound: 'Role not found',
        seededProtected: 'Built-in account is protected',
        superCannotDisable: 'Super administrator cannot be disabled',
        cannotEditSelfRoleOrStatus: 'Cannot change your own roles or status',
        passwordPolicy: 'Password does not meet the policy: {violations}',
        cannotDeleteSelf: 'Cannot delete yourself',
        cannotKickSelf: 'Cannot kick yourself',
        cannotResetSelfPassword: 'Change your own password in the user center',
        sessionPolicyInvalid: 'Invalid session policy',
        pwdSetTooFrequent: 'Password was set too recently, retry in {remainingSeconds}s',
        passwordConfirmMismatch: 'Passwords do not match',
        changePasswordThrottled: 'Too many attempts, please try again later',
        oldPasswordMismatch: 'Old password is incorrect',
        passwordSameAsOld: 'New password must differ from the old one'
      },
      audit: {
        invalidTable: 'The purge target is not in the allowed list',
        purgeBelowFloor: 'Retention days cannot be below {minDays} days'
      }
    }
  },
  // [rev6-inline BASE-WEB-I18N-WIRING(ii)+ 003-auth-session END]
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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ix)+ 008-audit-settings-pages START] 系統設定頁的路由標題鍵（鍵集與 zh-cn 相等；說明見 zh-cn.ts 同段）
    'manage_system-settings': 'System Settings',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ix)+ 008-audit-settings-pages END]
    manage_user: 'User Manage',
    'manage_user-detail': 'User Detail',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(x)+ 008-audit-settings-pages START] 稽核頁的路由標題鍵（鍵集與 zh-cn 相等；說明見 zh-cn.ts 同段）
    manage_audit: 'Audit Center',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(x)+ 008-audit-settings-pages END]
    manage_role: 'Role Manage',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] 授權回收桶頁的路由標題鍵，鍵名逐字取自 seed 選單列 10 之路由名。
    // 回收桶頁 view 目錄進場後外掛把此名重算進 RouteKey，本樹缺這一鍵即 typecheck 紅（另一語同插）。刻意放在 `manage_role` 與 `manage_menu`
    // 之間而不貼著 ip-rule 那塊：兩塊相連就落進同一個變更塊，拔掉本塊標記仍被鄰塊標記蓋住、lint 照綠
    'manage_policy-archive': 'Policy Recycle Bin',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
    manage_menu: 'Menu Manage',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] IP 規則管理頁的路由標題鍵。鍵名須逐字等於後端選單列的 route name；
    // 本樹型別由路由產物的 RouteKey 推得——view 目錄進場、外掛重算出此鍵後，這裡缺譯文即 typecheck 紅、側邊欄也只會顯裸鍵。
    'manage_ip-rule': 'IP Rule Manage',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
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
    // [rev6-inline BASE-WEB-I18N-WIRING(i)+ 007-user-password-admin START] 密碼政策違規碼八枚之譯文＋串接分隔符（鍵集與插位同 zh-cn.ts 同段、說明見該處；
    // 譯文逐字承 rev5:src/locales/langs/en-us.ts 之 backend 樹白名單同名鍵）
    passwordPolicy: {
      violation: {
        minLength: 'length below the policy minimum',
        maxLength: 'length exceeds the policy maximum',
        maxBytes: 'byte length exceeds the limit',
        requireDigit: 'must contain a digit',
        requireLowercase: 'must contain a lowercase letter',
        requireUppercase: 'must contain an uppercase letter',
        requireSpecial: 'must contain a special character',
        forbidUsername: 'must not be identical to the user name'
      },
      listSeparator: ', '
    },
    // [rev6-inline BASE-WEB-I18N-WIRING(i)+ 007-user-password-admin END]
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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin START] 個人中心「修改密碼」卡之文案（`page:` 樹新 top-level；卡標題、三欄標籤、送出鈕、
    // 成功提示與副作用說明）。鍵名與譯文承 rev5:src/locales/langs/en-us.ts 之同名子樹；頁標題不另設鍵（沿用既有 `route['user-center']`）。
    // 另兩語同插、型節住 typings/app.d.ts；插在 `home` 與 `function` 之間：前後皆為未改的基線行
    userCenter: {
      password: {
        title: 'Change Password',
        oldPassword: 'Old Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        submit: 'Save',
        success: 'Password changed; sessions on your other devices have been ended',
        hint: 'Password rules come from the system settings and are enforced by the server. After a successful change this device stays signed in and your other devices must sign in again.'
      }
    },
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin END]
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
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ix)+ 008-audit-settings-pages START] 系統設定頁文案（鍵集與 zh-cn 逐鍵相等；說明與例外四則見 zh-cn.ts 同段）。
      // 組標題與 label／help 逐字取 rev5:src/locales/langs/en-us.ts 之 page.manage.systemSettings；例外四則 help 句末補 not strict 之註（BL-00145）
      systemSettings: {
        group: {
          password: 'Password Policy',
          session: 'Session Settings',
          ip: 'IP-source login settings',
          account: 'Account login settings'
        },
        item: {
          password_min_length: { label: 'Minimum password length', help: 'Minimum password length' },
          password_max_length: { label: 'Maximum password length', help: 'Maximum password length' },
          password_require_lowercase: { label: 'Require lowercase letter', help: 'Must contain a lowercase letter' },
          password_require_uppercase: { label: 'Require uppercase letter', help: 'Must contain an uppercase letter' },
          password_require_digit: { label: 'Require digit', help: 'Must contain a digit' },
          password_require_special: { label: 'Require special character', help: 'Must contain a special character' },
          password_forbid_username: {
            label: 'Forbid password same as username',
            help: 'Forbid password identical to username'
          },
          password_change_min_interval: {
            label: 'Password set cooldown (seconds)',
            help: 'Minimum interval in seconds between password sets by the same operator on the same account; 0 disables'
          },
          single_session_default: { label: 'Single session (global)', help: 'Site-wide single-session default' },
          session_idle_timeout: { label: 'Session idle timeout (min)', help: 'Session idle timeout (minutes)' },
          ip_window_minutes: {
            label: 'IP-source login failure - counting window (min)',
            help: 'Source throttle: source-dimension sliding window length (minutes)'
          },
          ip_max_fails: {
            label: 'IP-source login failure - max count (times)',
            help: 'Source throttle: hard lock once failures in the source-bucket sliding window reach this count (not strict under concurrent first bursts)'
          },
          ip_captcha_after: {
            label: 'IP-source login failure - trigger captcha (times)',
            help: 'Source throttle: enter the captcha soft zone once failures in the source-bucket sliding window reach this count (not strict under concurrent first bursts)'
          },
          login_throttle_window_minutes: {
            label: 'Account login failure - counting window (min)',
            help: 'Login throttle: sliding window length (minutes) = maximum lockout duration'
          },
          login_throttle_max_fails: {
            label: 'Account login failure - max count (times)',
            help: 'Login throttle: lockout once failures in the sliding window reach this count (not strict under concurrent first bursts)'
          },
          login_throttle_captcha_after: {
            label: 'Account login failure - trigger captcha (times)',
            help: 'Login throttle: enter the captcha soft zone once failures in the sliding window reach this count (not strict under concurrent first bursts)'
          }
        },
        conflict: {
          password:
            'Minimum password length exceeds the maximum: adding users, resetting passwords and changing passwords will all be rejected. Adjust one of the two.',
          account:
            'Account login captcha threshold exceeds the lockout threshold: the three settings of this group fall back to their factory defaults as a whole.',
          ip: 'IP-source login captcha threshold exceeds the lockout threshold: the three settings of this group fall back to their factory defaults as a whole.'
        },
        readonlyTag: 'Read-only'
      },
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ix)+ 008-audit-settings-pages END]
      common: {
        status: {
          enable: 'Enable',
          disable: 'Disable'
        }
      },
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] IP 規則管理頁文案（鍵集＝rev5:src/locales/langs 同名子樹逐鍵、零增減；
      // 三語鍵集須相等、型節住 typings/app.d.ts）。`order` 的譯文刻意避開「優先」語意：規則判定是 any-match、該欄只管清單顯示排序（憲法 §I.7 島 F）。
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
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vii)+ 007-user-password-admin START] 表頭前綴插槽「解鎖來源 IP」鈕與其彈窗之文案（鈕標籤兼彈窗標題、位址欄標籤、成功提示）；
        // 巢狀於上方 (i) 塊內。ipAddress／success 鍵名與譯文沿 rev5:src/locales/langs 之 page.manage.user.unlock 同名鍵、title 為 007 刀新鍵；三語鍵集須相等、型節住 typings/app.d.ts
        unlock: {
          title: 'Unlock Source IP',
          ipAddress: 'IP Address',
          success: 'Unlocked'
        },
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vii)+ 007-user-password-admin END]
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
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleCode: 'Role Code',
        roleStatus: 'Role Status',
        roleDesc: 'Role Description',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 角色備註欄的欄標籤（鍵名與譯文承 rev5:src/locales/langs 同名鍵；
        // 三語鍵集須相等、型節住 typings/app.d.ts）。刻意插在物件非末項之間：塊內零移除行、拔標記即被 fork-delta-lint 報為未圈界新增
        roleMemo: 'Role Memo',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        menuAuth: 'Menu Auth',
        buttonAuth: 'Button Auth',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 角色抽屜第三鈕「端點權限」的鈕面文字、亦為端點權限彈窗標題的後半
        // （FR-037；譯文承 rev5:src/locales/langs 同名鍵；另一語同插、型節住 typings/app.d.ts）。接在 `buttonAuth` 之後、`form` 子樹之前：
        // 非物件末項，上一行不必補尾逗號、塊內零移除行，拔掉圈界即被 fork-delta-lint 報為未圈界新增
        endpointAuth: 'Endpoint Auth',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
        form: {
          roleName: 'Please enter role name',
          roleCode: 'Please enter role code',
          roleStatus: 'Please select role status',
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 角色備註欄的輸入提示：文案須註明僅管理員可見（該欄只上管理清單）；
          // 插位理由同上方欄標籤塊（非末項之間）
          roleMemo: 'Role memo (visible to administrators only)',
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
          roleDesc: 'Please enter role description'
        },
        addRole: 'Add Role',
        editRole: 'Edit Role'
      },
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(x)+ 008-audit-settings-pages START] 稽核頁文案（鍵集與 zh-cn 相等；說明見 zh-cn.ts 同段）。
      // 葉值逐字取 rev5:src/locales/langs/en-us.ts 之 page.manage.audit，相異三處同 zh-cn：動作提示範例改小寫、purge.title 併入 {table}、notice.access 新增
      audit: {
        title: 'Audit Center',
        tab: {
          operation: 'Operation Log',
          access: 'Access Log',
          login: 'Login Attempts',
          session: 'Session Events'
        },
        search: {
          operatorId: 'Operator ID',
          operatorName: 'Operator Name',
          userId: 'User ID',
          timeRange: 'Time Range',
          placeholder: {
            entityTable: 'Enter entity table',
            operation: 'Enter action (e.g. update, kick)',
            operatorId: 'Enter operator ID',
            operatorName: 'Enter operator name',
            httpMethod: 'Enter method (e.g. GET)',
            httpStatus: 'Enter status code',
            httpPath: 'Enter path (fuzzy match)',
            attemptedUserName: 'Enter account name (fuzzy match)',
            success: 'Select result',
            realIp: 'Enter source IP (exact match)',
            userId: 'Enter user ID',
            userName: 'Enter user name',
            eventType: 'Enter event type (e.g. kicked, idle)',
            reason: 'Enter reason',
            timeRange: 'Select time range'
          }
        },
        column: {
          createTime: 'Time',
          operator: 'Operator',
          operation: 'Action',
          entityTable: 'Entity Table',
          entityId: 'Entity ID',
          snapshot: 'Snapshot',
          realIp: 'Source IP',
          xForwardedFor: 'X-Forwarded-For',
          region: 'Region',
          traceId: 'Trace ID',
          httpMethod: 'Method',
          httpPath: 'Path',
          httpStatus: 'Status',
          attemptedUserName: 'Attempted Account',
          success: 'Result',
          successOption: {
            true: 'Success',
            false: 'Failure'
          },
          user: 'User',
          sid: 'Session ID',
          eventType: 'Event Type',
          reason: 'Reason',
          sourceIp: 'Source IP'
        },
        snapshot: {
          entry: 'View',
          title: 'Snapshot',
          before: 'Before',
          after: 'After',
          empty: '(no snapshot)'
        },
        purge: {
          entry: 'Purge',
          title: 'Purge Logs：{table}',
          days: 'Retention Days',
          daysHint: 'Records older than the given number of days will be deleted; minimum 30 days.',
          warning:
            'This permanently deletes records older than the retention days and cannot be undone; the purge action itself is recorded in the operation log.',
          confirm: 'Confirm purge? This action cannot be undone.',
          success: 'Purge complete, {count} records deleted'
        },
        notice: {
          access:
            'The Status column shows the HTTP status code: 403 for insufficient permissions; all other requests (including business rejections and system errors) show 200.',
          login:
            'Login attempts rejected by throttle short-circuit are not recorded in this table; only attempts with an actual success/failure verdict are shown here.'
        }
      },
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(x)+ 008-audit-settings-pages END]
      user: {
        title: 'User List',
        userName: 'User Name',
        userGender: 'Gender',
        nickName: 'Nick Name',
        userPhone: 'Phone Number',
        userEmail: 'Email',
        userStatus: 'User Status',
        userRole: 'User Role',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 使用者管理頁接真之補鍵（鍵集與插位同 zh-cn.ts 同段、說明見該處；
        // 既有鍵譯文沿 rev5:src/locales/langs/en-us.ts 同名鍵）
        password: 'Password',
        roles: 'Roles',
        roleSeparator: ', ',
        sessionPolicy: 'Session Policy',
        userMemo: 'Memo',
        createdAt: 'Created At',
        createdBy: 'Created By',
        updatedAt: 'Updated At',
        updatedBy: 'Updated By',
        showDeleted: 'Show Deleted',
        restore: 'Restore',
        confirmRestore: 'Restore this user?',
        restoreHint: 'The restored account holds no role and must be reassigned',
        restoreSuccess: 'Restored',
        roleDisabledTag: ' (Disabled)',
        roleOptionsUnavailable:
          'Failed to load role options; role assignment is unavailable. Close the drawer and try again.',
        sessionPolicyOption: {
          inherit: 'Inherit',
          single: 'Single Device',
          multi: 'Multiple Devices'
        },
        sessionPolicyHint: 'Only the super administrator can change the session policy',
        passwordHint:
          'Password rules are enforced by the server; use the button on the right to generate one that meets the current policy',
        kick: 'Kick Out',
        confirmKick: 'End all sessions of this user?',
        kickSuccess: 'All sessions of this user have been ended',
        resetPwd: 'Reset Password',
        resetPwdTitle: 'Reset password: {userName}',
        newPassword: 'New Password',
        resetPwdSuccess: 'Password reset; all sessions of this user have been ended',
        randomPassword: 'Random Password',
        pwdGen: {
          title: 'Generate Random Password',
          length: 'Length',
          generate: 'Regenerate',
          copy: 'Copy',
          copied: 'Copied to clipboard',
          copyFailed: 'Copy failed, please select the password above and copy it manually',
          apply: 'Apply'
        },
        unlockLogin: 'Unlock Login',
        unlockLoginConfirm: 'Clear the login lock of this user?',
        unlockLoginSuccess: 'Unlocked',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
        form: {
          userName: 'Please enter user name',
          userGender: 'Please select gender',
          nickName: 'Please enter nick name',
          userPhone: 'Please enter phone number',
          userEmail: 'Please enter email',
          userStatus: 'Please select user status',
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 抽屜新增欄（設密、記事）之輸入提示（插位同 zh-cn.ts 同段）
          password: 'Please enter password',
          userMemo: 'Memo (visible to administrators only)',
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
          userRole: 'Please select user role'
        },
        addUser: 'Add User',
        editUser: 'Edit User',
        gender: {
          male: 'Male',
          female: 'Female'
        }
      },
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] 授權回收桶頁（含搜尋卡）的文案子樹：鍵集照 rev5:src/locales/langs 同名子樹，
      // 每一鍵都有頁面消費處（主檔或搜尋卡）；另一語同插、型節住 typings/app.d.ts。歸檔原因欄照封閉詞彙原字面顯示，故不設其譯文；復原相關鍵本頁自備、
      // 不借選單回收桶的同義鍵。落在 `user` 與 `menu` 之間：前後都是未改的基線行、塊內零移除行，拔掉圈界即被 fork-delta-lint 報為未圈界新增
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
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
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
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 選單頁的備註欄標籤與回收桶四鍵（顯示已刪除開關、確認復原、復原鈕、復原成功提示；鍵名與譯文承
        // rev5:src/locales/langs 同名鍵；三語鍵集須相等、型節住 typings/app.d.ts）。插在物件非末項之間：塊內零移除行、拔標記即被 fork-delta-lint 報為未圈界新增
        menuMemo: 'Menu Memo',
        showDeleted: 'Show Deleted',
        restore: 'Restore',
        confirmRestore: 'Restore this menu?',
        restoreSuccess: 'Restored',
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 選單備註欄的輸入提示（文案須註明僅管理員可見）與父選擇器首項「頂層」節點的標籤
          // （鍵名與譯文承 rev5:src/locales/langs 同名鍵）；插在 form 非末項之間：塊內零移除行、拔標記即被 fork-delta-lint 報為未圈界新增
          menuMemo: 'Menu memo (visible to administrators only)',
          parentRoot: 'Top level (no parent)',
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
          menuStatus: 'Please select menu status'
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
