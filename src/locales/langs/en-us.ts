const local: App.I18n.Schema = {
  // [rev4-inline I18N-WIRING(ii) 004-system-settings START] backend 命名空間（映射 wire msg → 在地化顯示）
  backend: {
    common: {
      // [rev4-inline I18N-WIRING(ii) 011-user-admin] 明細清單在地化分隔符（passwordPolicy violations join 用；T024）
      listSeparator: ', ',
      success: 'Operation successful'
    },
    // [rev4-inline I18N-WIRING(ii) 005-auth-login] auth 命名空間（登入失敗／token 逾期／session 重登在地化）
    auth: {
      login: {
        failed: 'Incorrect username or password',
        locked: 'Too many failed login attempts, please try again later',
        captchaRequired: 'Please complete the captcha and try again'
      },
      token: {
        expired: 'Login expired'
      },
      session: {
        reLogin: 'Please log in again',
        kicked: 'Your account is logged in on another device'
      }
    },
    biz: {
      systemSettings: {
        notFound: 'Setting item not found',
        invalidValue: 'Invalid setting value'
      },
      // [rev4-inline I18N-WIRING(ii) 005-auth-login] biz.auth（stub 端點未開放提示）
      auth: {
        notSupported: 'This feature is not yet available'
      },
      // [rev4-inline I18N-WIRING(ii) 009-role-admin] biz.role/policy 治理拒因（distinct key；inUse 攜 {userCount} 插值、protectedRevoke 泛化訊息＋blocked 明細走呼叫端；ADR 0050）
      role: {
        seededProtected: 'System built-in role cannot be deleted',
        inUse: 'This role is assigned to {userCount} user(s) and cannot be deleted',
        cannotDeleteSelfRole: 'Cannot delete a role assigned to the current user',
        cannotDisableSelfRole: 'Cannot disable a role assigned to the current user',
        superCannotDisable: 'The super administrator role cannot be disabled',
        codeImmutable: 'Role code cannot be changed after creation',
        codeExists: 'Role code already exists',
        codeInvalid: 'Invalid role code (letters, digits and underscore only, up to 64 characters)',
        notFound: 'Role not found',
        protectedRevoke: 'Some protected grants exist and cannot be revoked'
      },
      // [rev4-inline I18N-WIRING(ii) 010-menu-admin] biz.menu 治理拒因十鍵（一因一鍵、皆 scalar 無插值；data 明細走呼叫端渲染；R9／ADR 0050）
      menu: {
        protectedMenu: 'System built-in menu cannot be deleted',
        hasChildren: 'This menu still has child items; please handle the child items first',
        routeNameImmutable: 'Route name cannot be changed after creation',
        menuTypeImmutable: 'Menu type cannot be changed after creation',
        routeNameExists: 'Route name already exists',
        routeNameInvalid: 'Invalid route name (letters, digits, underscore and hyphen only, up to 100 characters)',
        parentNotFound: 'Parent menu not found',
        parentDeleted: 'Parent menu has been deleted; please restore the parent first',
        cycleDetected: 'A menu cannot be moved under itself or its descendants',
        notFound: 'Menu not found'
      },
      // [rev4-inline I18N-WIRING(ii) 011-user-admin] biz.user 拒因 15 鍵（一因一鍵；passwordPolicy 攜 {violations} scalar 插值——陣列在攔截層逐碼經 passwordViolation 子鍵譯後 join；ADR 0050/0054）＋biz.unlock 2 鍵（007 欠帳）
      user: {
        seededProtected: 'System built-in account cannot be deleted',
        cannotDeleteSelf: 'Cannot delete the currently logged-in user',
        cannotDisableSelf: 'Cannot disable the currently logged-in user',
        cannotKickSelf: 'Cannot kick the currently logged-in user',
        cannotChangeSelfRoles: 'Cannot change the role assignment of the currently logged-in user',
        superCannotDisable: 'The super administrator account cannot be disabled',
        superRoleProtected: 'Cannot remove the super administrator role assignment from the super administrator account',
        userNameExists: 'User name already exists',
        userNameImmutable: 'User name cannot be changed after creation',
        userNameInvalid: 'Invalid user name (letters, digits, underscore and hyphen only, up to 64 characters)',
        // [rev4-inline I18N-WIRING(ii) 014-user-center] 自助改密拒因 3 鍵（皆 scalar 無插值；序照固定驗證序 data-model §4、置 passwordPolicy 前）
        passwordMismatch: 'The two new passwords do not match',
        oldPasswordMismatch: 'Old password is incorrect',
        passwordSameAsOld: 'New password must not be the same as the old password',
        passwordPolicy: 'Password does not meet the password policy: {violations}',
        passwordViolation: {
          minLength: 'length below the policy minimum',
          maxLength: 'length exceeds the policy maximum',
          maxBytes: 'byte length exceeds the limit',
          requireDigit: 'must contain a digit',
          requireLowercase: 'must contain a lowercase letter',
          requireUppercase: 'must contain an uppercase letter',
          requireSpecial: 'must contain a special character',
          forbidUsername: 'must not be identical to the user name'
        },
        roleNotFound: 'The selected role does not exist or has been deleted',
        userNotFound: 'User not found',
        sessionPolicyInvalid: 'Invalid session policy value (inherit, single or multi only)'
      },
      unlock: {
        invalidTarget: 'Invalid unlock target (user dimension requires a user name; IP dimension requires a valid IP address)',
        invalidDimension: 'Invalid unlock dimension (only the user and IP dimensions are supported)'
      },
      // [rev4-inline I18N-WIRING(ii) 012-audit-admin] biz.audit 清理拒因 2 鍵（invalidTable scalar；purgeBelowFloor 攜 {minDays} named-object 插值——translateBackendMsg 原生支援；ADR 0050）
      audit: {
        invalidTable: 'The purge target is not in the allowed list',
        purgeBelowFloor: 'Retention days cannot be below {minDays} days'
      },
      policy: {
        notRestorable: 'This archived grant cannot be restored'
      },
      // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin] biz.ipRule 拒因 5 鍵（皆 scalar 無插值；data-model §6；★invalidRuleType 兼收 wbipType 與 deleted 參數值域拒因、措辭不綁死類型欄）
      ipRule: {
        selfLock: 'This change would block your current source address; operation rejected',
        conflict: 'An active rule with the same CIDR and type already exists',
        invalidCidr: 'Invalid CIDR format (IPv4/IPv6)',
        invalidRuleType: 'Invalid rule type or parameter value',
        notFound: 'IP rule does not exist or has been deleted'
      }
    },
    system: {
      forbidden: 'You do not have permission to perform this action'
    }
  },
  // [rev4-inline I18N-WIRING(ii) 004-system-settings END]
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
    // [rev4-inline MODAL-WIRING(e) 004-system-settings] gen-route 產出 manage_system-settings route → route locale 型閘門要求補鍵
    'manage_system-settings': 'System Settings',
    // [rev4-inline MODAL-WIRING(e) 009-role-admin] gen-route 產出 manage_policy-archive route → route locale 型閘門要求補鍵（B-061 三清一）
    'manage_policy-archive': 'Policy Recycle Bin',
    // [rev4-inline I18N-WIRING(ii) 012-audit-admin] gen-route 產出 manage_audit route → route locale 型閘門要求補鍵（B-061 audit 項）
    manage_audit: 'Audit Center',
    // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin] gen-route 產出 manage_ip-rule route → route locale 型閘門要求補鍵（B-061 ip-rule 項）
    'manage_ip-rule': 'IP Rule Manage',
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
      // [rev4-inline I18N-WIRING(ii) 004-system-settings START] 系統設定頁字串
      systemSettings: {
        passwordPolicyTitle: 'Password Policy',
        sessionTitle: 'Session Settings',
        ipLoginTitle: 'IP-source login settings',
        accountLoginTitle: 'Account login settings',
        items: {
          passwordMinLength: 'Minimum password length',
          passwordMaxLength: 'Maximum password length',
          passwordRequireLowercase: 'Require lowercase letter',
          passwordRequireUppercase: 'Require uppercase letter',
          passwordRequireDigit: 'Require digit',
          passwordRequireSpecial: 'Require special character',
          passwordForbidUsername: 'Forbid password same as username',
          singleSessionDefault: 'Single session (global)',
          sessionIdleTimeout: 'Session idle timeout (min)',
          ipMaxFails: 'IP-source login failure - max count (times)',
          ipWindowMinutes: 'IP-source login failure - counting window (min)',
          ipCaptchaAfter: 'IP-source login failure - trigger captcha (times)',
          loginThrottleMaxFails: 'Account login failure - max count (times)',
          loginThrottleWindowMinutes: 'Account login failure - counting window (min)',
          loginThrottleCaptchaAfter: 'Account login failure - trigger captcha (times)'
        },
        // B-059 tooltip 三語化：per-key help 說明（IconTooltip 用；未鍵化 fallback item.description）
        help: {
          passwordMinLength: 'Minimum password length',
          passwordMaxLength: 'Maximum password length',
          passwordRequireLowercase: 'Must contain a lowercase letter',
          passwordRequireUppercase: 'Must contain an uppercase letter',
          passwordRequireDigit: 'Must contain a digit',
          passwordRequireSpecial: 'Must contain a special character',
          passwordForbidUsername: 'Forbid password identical to username',
          singleSessionDefault: 'Site-wide single-session default',
          sessionIdleTimeout: 'Session idle timeout (minutes)',
          ipMaxFails: 'Source throttle: hard lock once failures in the source-bucket sliding window reach this count',
          ipWindowMinutes: 'Source throttle: source-dimension sliding window length (minutes)',
          ipCaptchaAfter: 'Source throttle: enter the captcha soft zone once failures in the source-bucket sliding window reach this count',
          loginThrottleMaxFails: 'Login throttle: lockout once failures in the sliding window reach this count',
          loginThrottleWindowMinutes: 'Login throttle: sliding window length (minutes) = maximum lockout duration',
          loginThrottleCaptchaAfter: 'Login throttle: enter the captcha soft zone once failures in the sliding window reach this count'
        }
      },
      // [rev4-inline I18N-WIRING(ii) 004-system-settings END]
      common: {
        status: {
          enable: 'Enable',
          disable: 'Disable'
        }
      },
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleCode: 'Role Code',
        roleStatus: 'Role Status',
        roleDesc: 'Role Description',
        menuAuth: 'Menu Auth',
        buttonAuth: 'Button Auth',
        // [rev4-inline MODAL-WIRING(c) 009-role-admin] endpoint-auth-modal net-new modal 自身 key（(c) 明文授權）
        endpointAuth: 'Endpoint Auth',
        form: {
          roleName: 'Please enter role name',
          roleCode: 'Please enter role code',
          roleStatus: 'Please select role status',
          roleDesc: 'Please enter role description'
        },
        addRole: 'Add Role',
        editRole: 'Edit Role'
      },
      // [rev4-inline MODAL-WIRING(e) 009-role-admin START] 授權回收桶頁字串（憲法 §III.2 (e) 明文授權新頁 i18n；B-061 三清一）
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
      // [rev4-inline MODAL-WIRING(e) 009-role-admin END]
      // [rev4-inline I18N-WIRING(ii) 012-audit-admin START] 稽核中心頁字串（四分頁標題/欄位/清理對話框/語意說明/操作鈕；purge.success 攜 {count} 前端插值）
      audit: {
        title: 'Audit Center',
        tab: {
          operation: 'Operation Log',
          access: 'Access Log',
          login: 'Login Attempts',
          session: 'Session Events'
        },
        common: {
          createTime: 'Time',
          operator: 'Operator',
          operatorId: 'Operator ID',
          operatorName: 'Operator Name',
          realIp: 'Source IP',
          region: 'Region',
          traceId: 'Trace ID',
          timeRange: 'Time Range'
        },
        operation: {
          entityTable: 'Entity Table',
          operation: 'Action',
          entityId: 'Entity ID',
          payload: 'Snapshot',
          viewPayload: 'View',
          emptyPayload: '(no snapshot)',
          payloadBefore: 'Before',
          payloadAfter: 'After'
        },
        access: {
          httpMethod: 'Method',
          httpStatus: 'Status',
          httpPath: 'Path'
        },
        login: {
          attemptedUserName: 'Attempted Account',
          success: 'Result',
          successOption: {
            true: 'Success',
            false: 'Failure'
          },
          throttleNote:
            'Login attempts rejected by throttle short-circuit are not recorded in this table; only attempts with an actual success/failure verdict are shown here.'
        },
        session: {
          userId: 'User ID',
          userName: 'User',
          sid: 'Session ID',
          eventType: 'Event Type',
          reason: 'Reason',
          sourceIp: 'Source IP'
        },
        form: {
          entityTable: 'Enter entity table',
          operation: 'Enter action (e.g. UPDATE, KICK)',
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
        },
        purge: {
          title: 'Purge Logs',
          entry: 'Purge',
          beforeDays: 'Retention Days',
          beforeDaysHint: 'Records older than the given number of days will be deleted; minimum 30 days.',
          warning:
            'This permanently deletes records older than the retention days and cannot be undone; the purge action itself is recorded in the operation log.',
          confirm: 'Confirm purge? This action cannot be undone.',
          success: 'Purge complete, {count} records deleted'
        }
      },
      // [rev4-inline I18N-WIRING(ii) 012-audit-admin END]
      // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin START] IP 規則頁清單面字串（T015；欄名／狀態三態／類型標籤／搜尋卡 placeholder／空值降級「—」）
      // ＋寫端面字串（T019；drawer 標題／復原鈕＋確認＋成功 toast／drawer 表單 placeholder）；★order 一律「排序值」語彙、不得暗示優先序＝島 F F1 any-match
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
        confirmRestore: 'Confirm restore this rule?',
        restoreSuccess: 'Restore succeeded',
        ruleTypeMap: {
          allow: 'Allow',
          deny: 'Deny'
        },
        form: {
          wbipCidr: 'Enter CIDR fragment (fuzzy match)',
          wbipType: 'Select rule type',
          status: 'Select status',
          cidr: 'Enter CIDR (IPv4/IPv6, e.g. 192.168.1.0/24)',
          type: 'Select rule type',
          memo: 'Enter memo (optional)',
          order: 'Enter display order (optional)'
        },
        empty: '—'
      },
      // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin END]
      user: {
        title: 'User List',
        userName: 'User Name',
        userGender: 'Gender',
        nickName: 'Nick Name',
        userPhone: 'Phone Number',
        userEmail: 'Email',
        userStatus: 'User Status',
        userRole: 'User Role',
        // [rev4-inline I18N-WIRING(ii) 011-user-admin] user 頁維運動作＋回收桶＋drawer 控件＋解鎖 modal 字串（T023；showDeleted／restore／restoreSuccess 複用既有 entity-neutral 鍵不重建）
        password: 'Password',
        sessionPolicy: 'Session Policy',
        sessionPolicyOption: {
          inherit: 'Follow Global Setting',
          single: 'Single Session',
          multi: 'Multiple Sessions'
        },
        kick: 'Kick Offline',
        confirmKick: 'Confirm to kick all sessions of this user?',
        kickSuccess: 'Kick success',
        resetPwd: 'Reset Password',
        resetPwdSuccess: 'Password reset success',
        resetPwdUnlockHint: 'If this account is locked out of login, unlock it separately',
        confirmRestore: 'Confirm to restore this user?',
        deletedAt: 'Deleted At',
        unlock: {
          title: 'Unlock Login',
          dimension: 'Lock Dimension',
          target: 'Unlock Target',
          dimensionLabel: {
            user: 'User',
            ip: 'IP Source'
          },
          success: 'Unlock success',
          form: {
            dimension: 'Please select lock dimension',
            userName: 'Please enter the user name to unlock',
            target: 'Please enter the IP address to unlock'
          }
        },
        form: {
          // [rev4-inline I18N-WIRING(ii) 011-user-admin] drawer add 密碼欄＋edit 會話策略 placeholder（T023）
          password: 'Please enter password',
          sessionPolicy: 'Please select session policy',
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
          menuStatus: 'Please select menu status'
        },
        addMenu: 'Add Menu',
        editMenu: 'Edit Menu',
        addChildMenu: 'Add Child Menu',
        // [rev4-inline (d) 010-menu-admin] 顯示已刪除 toggle＋復原確認（憲法 §III.2(d) 錨點；restore/restoreSuccess 復用 policyArchive entity-neutral）
        showDeleted: 'Show Deleted',
        confirmRestore: 'Confirm to restore this menu?',
        type: {
          directory: 'Directory',
          menu: 'Menu'
        },
        iconType: {
          iconify: 'Iconify Icon',
          local: 'Local Icon'
        }
      }
    },
    // [rev4-inline (g) 014-user-center START] 個人中心 self-service 頁文案（4 卡＋created/updated＋改密＋D3 成功 toast；en 照 rev3 en-us.ts 底本潤飾、砍死鍵 changePwdBtn；v1.12.0 (g) 擴字串射程）
    userCenter: {
      title: 'User Center',
      basicInfoTitle: 'Basic Info',
      phoneTitle: 'Phone',
      emailTitle: 'Email',
      passwordTitle: 'Change Password',
      userName: 'Account',
      roles: 'Roles',
      gender: 'Gender',
      nickName: 'Nickname',
      userPhone: 'Phone',
      userEmail: 'Email',
      save: 'Save',
      createdAt: 'Created At',
      updatedAt: 'Last Modified',
      notModified: 'Not modified',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      // 改密成功專屬 toast（D3 行為增補、rev3 無此鍵；語意固定＝密碼已更新＋其他裝置已登出）
      changePwdSuccessRevoked: 'Password updated. Other devices have been logged out',
      origin: {
        systemCreated: 'Created by system',
        adminCreated: 'Created by administrator',
        systemUpdated: 'Modified by system',
        adminUpdated: 'Modified by administrator'
      },
      verify: {
        sendCode: 'Send Code',
        codePlaceholder: 'Verification Code',
        verify: 'Verify',
        comingSoon: 'Coming soon',
        emailCode: 'Email code',
        phoneCode: 'Phone code',
        backfillHint: 'fills the input on the left'
      }
    }
    // [rev4-inline (g) 014-user-center END]
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
