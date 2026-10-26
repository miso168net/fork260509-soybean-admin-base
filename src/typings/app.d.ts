/** The global namespace for the app */
declare namespace App {
  /** Theme namespace */
  namespace Theme {
    type ColorPaletteNumber = import('@sa/color').ColorPaletteNumber;

    /** NaiveUI theme overrides that can be specified in preset */
    type NaiveUIThemeOverride = import('naive-ui').GlobalThemeOverrides;

    /** Theme setting */
    interface ThemeSetting {
      /** Theme scheme */
      themeScheme: UnionKey.ThemeScheme;
      /** grayscale mode */
      grayscale: boolean;
      /** colour weakness mode */
      colourWeakness: boolean;
      /** Whether to recommend color */
      recommendColor: boolean;
      /** Theme color */
      themeColor: string;
      /** Theme radius */
      themeRadius: number;
      /** Other color */
      otherColor: OtherColor;
      /** Whether info color is followed by the primary color */
      isInfoFollowPrimary: boolean;
      /** Layout */
      layout: {
        /** Layout mode */
        mode: UnionKey.ThemeLayoutMode;
        /** Scroll mode */
        scrollMode: UnionKey.ThemeScrollMode;
      };
      /** Page */
      page: {
        /** Whether to show the page transition */
        animate: boolean;
        /** Page animate mode */
        animateMode: UnionKey.ThemePageAnimateMode;
      };
      /** Header */
      header: {
        /** Header height */
        height: number;
        /** Header breadcrumb */
        breadcrumb: {
          /** Whether to show the breadcrumb */
          visible: boolean;
          /** Whether to show the breadcrumb icon */
          showIcon: boolean;
        };
        /** Multilingual */
        multilingual: {
          /** Whether to show the multilingual */
          visible: boolean;
        };
        globalSearch: {
          /** Whether to show the GlobalSearch */
          visible: boolean;
        };
      };
      /** Tab */
      tab: {
        /** Whether to show the tab */
        visible: boolean;
        /**
         * Whether to cache the tab
         *
         * If cache, the tabs will get from the local storage when the page is refreshed
         */
        cache: boolean;
        /** Tab height */
        height: number;
        /** Tab mode */
        mode: UnionKey.ThemeTabMode;
        /** Whether to close tab by middle click */
        closeTabByMiddleClick: boolean;
      };
      /** Fixed header and tab */
      fixedHeaderAndTab: boolean;
      /** Sider */
      sider: {
        /** Inverted sider */
        inverted: boolean;
        /** Sider width */
        width: number;
        /** Collapsed sider width */
        collapsedWidth: number;
        /** Sider width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or 'top-hybrid-header-first' */
        mixWidth: number;
        /**
         * Collapsed sider width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or
         * 'top-hybrid-header-first'
         */
        mixCollapsedWidth: number;
        /** Child menu width when the layout is 'vertical-mix', 'top-hybrid-sidebar-first', or 'top-hybrid-header-first' */
        mixChildMenuWidth: number;
        /** Whether to auto select the first submenu */
        autoSelectFirstMenu: boolean;
      };
      /** Footer */
      footer: {
        /** Whether to show the footer */
        visible: boolean;
        /** Whether fixed the footer */
        fixed: boolean;
        /** Footer height */
        height: number;
        /**
         * Whether float the footer to the right when the layout is 'top-hybrid-sidebar-first' or
         * 'top-hybrid-header-first'
         */
        right: boolean;
      };
      /** Watermark */
      watermark: {
        /** Whether to show the watermark */
        visible: boolean;
        /** Watermark text */
        text: string;
        /** Whether to use user name as watermark text */
        enableUserName: boolean;
        /** Whether to use current time as watermark text */
        enableTime: boolean;
        /** Time format for watermark text */
        timeFormat: string;
      };
      /** define some theme settings tokens, will transform to css variables */
      tokens: {
        light: ThemeSettingToken;
        dark?: {
          [K in keyof ThemeSettingToken]?: Partial<ThemeSettingToken[K]>;
        };
      };
    }

    interface OtherColor {
      info: string;
      success: string;
      warning: string;
      error: string;
    }

    interface ThemeColor extends OtherColor {
      primary: string;
    }

    type ThemeColorKey = keyof ThemeColor;

    type ThemePaletteColor = {
      [key in ThemeColorKey | `${ThemeColorKey}-${ColorPaletteNumber}`]: string;
    };

    type BaseToken = Record<string, Record<string, string>>;

    interface ThemeSettingTokenColor {
      /** the progress bar color, if not set, will use the primary color */
      nprogress?: string;
      container: string;
      layout: string;
      inverted: string;
      'base-text': string;
    }

    interface ThemeSettingTokenBoxShadow {
      header: string;
      sider: string;
      tab: string;
    }

    interface ThemeSettingToken {
      colors: ThemeSettingTokenColor;
      boxShadow: ThemeSettingTokenBoxShadow;
    }

    type ThemeTokenColor = ThemePaletteColor & ThemeSettingTokenColor;

    /** Theme token CSS variables */
    type ThemeTokenCSSVars = {
      colors: ThemeTokenColor & { [key: string]: string };
      boxShadow: ThemeSettingTokenBoxShadow & { [key: string]: string };
    };
  }

  /** Global namespace */
  namespace Global {
    type VNode = import('vue').VNode;
    type RouteLocationNormalizedLoaded = import('vue-router').RouteLocationNormalizedLoaded;
    type RouteKey = import('@elegant-router/types').RouteKey;
    type RouteMap = import('@elegant-router/types').RouteMap;
    type RoutePath = import('@elegant-router/types').RoutePath;
    type LastLevelRouteKey = import('@elegant-router/types').LastLevelRouteKey;

    /** The router push options */
    type RouterPushOptions = {
      query?: Record<string, string>;
      params?: Record<string, string>;
      force?: boolean;
    };

    /** The global header props */
    interface HeaderProps {
      /** Whether to show the logo */
      showLogo?: boolean;
      /** Whether to show the menu toggler */
      showMenuToggler?: boolean;
      /** Whether to show the menu */
      showMenu?: boolean;
    }

    /** The global menu */
    type Menu = {
      /**
       * The menu key
       *
       * Equal to the route key
       */
      key: string;
      /** The menu label */
      label: string;
      /** The menu i18n key */
      i18nKey?: I18n.I18nKey | null;
      /** The route key */
      routeKey: RouteKey;
      /** The route path */
      routePath: RoutePath;
      /** The menu icon */
      icon?: () => VNode;
      /** The menu children */
      children?: Menu[];
    };

    type Breadcrumb = Omit<Menu, 'children'> & {
      options?: Breadcrumb[];
    };

    /** Tab route */
    type TabRoute = Pick<RouteLocationNormalizedLoaded, 'name' | 'path' | 'meta'> &
      Partial<Pick<RouteLocationNormalizedLoaded, 'fullPath' | 'query' | 'matched'>>;

    /** The global tab */
    type Tab = {
      /** The tab id */
      id: string;
      /** The tab label */
      label: string;
      /**
       * The new tab label
       *
       * If set, the tab label will be replaced by this value
       */
      newLabel?: string;
      /**
       * The old tab label
       *
       * when reset the tab label, the tab label will be replaced by this value
       */
      oldLabel?: string;
      /** The tab route key */
      routeKey: LastLevelRouteKey;
      /** The tab route path */
      routePath: RouteMap[LastLevelRouteKey];
      /** The tab route full path */
      fullPath: string;
      /** The tab fixed index */
      fixedIndex?: number | null;
      /**
       * Tab icon
       *
       * Iconify icon
       */
      icon?: string;
      /**
       * Tab local icon
       *
       * Local icon
       */
      localIcon?: string;
      /** I18n key */
      i18nKey?: I18n.I18nKey | null;
    };

    /** Form rule */
    type FormRule = import('naive-ui').FormItemRule;

    /** The global dropdown key */
    type DropdownKey = 'closeCurrent' | 'closeOther' | 'closeLeft' | 'closeRight' | 'closeAll' | 'pin' | 'unpin';
  }

  /**
   * I18n namespace
   *
   * Locales type
   */
  namespace I18n {
    type RouteKey = import('@elegant-router/types').RouteKey;

    // [rev6-inline BASE-WEB-I18N-WIRING(iii) 007-user-password-admin] 語系型別擴繁中（三處註冊之中以本型為鍵全集標型者計四表＝`locale.ts` 之 `locales`、`naive.ts` 之 `naiveLocales` 與 `naiveDateLocales`、`dayjs.ts` 之 `localMap`，任一表缺 `zh-TW` 項即 typecheck 紅；射程外：`dayjs.ts` 之 `import 'dayjs/locale/zh-tw'` 屬副作用匯入、型別看不見，漏寫時 typecheck 照綠，承載＝審查兜底）；原行: type LangType = 'en-US' | 'zh-CN';
    type LangType = 'en-US' | 'zh-CN' | 'zh-TW';

    type LangOption = {
      label: string;
      key: LangType;
    };

    type I18nRouteKey = Exclude<RouteKey, 'root' | 'not-found'>;

    type FormMsg = {
      required: string;
      invalid: string;
    };

    type Schema = {
      // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 003-auth-session START] backend 必填型節（逐鍵鏡像 locale backend 樹；譯文權威＝三檔 locale 各自的 backend 子樹＝ADR-00084、鍵集與鍵數以跨端閘對賬為準、首批鍵的史料出處＝`specs/003-auth-session/contracts/msg-keys.md`；必填＝三語 locale（en-us／zh-cn／zh-tw）皆以 `App.I18n.Schema` 標型、任一語缺樹即 typecheck 紅；繁中之語系型別與三處註冊見上方 `LangType` 標記）
      backend: {
        common: { success: string };
        system: { internal: string; notFound: string; forbidden: string };
        auth: {
          login: { failed: string };
          session: { reLogin: string; kicked: string; kickedByAdmin: string };
          token: { expired: string };
        };
        biz: {
          systemSettings: { invalidValue: string; notFound: string };
          auth: { notSupported: string; captchaRequired: string; locked: string };
          ipRule: {
            invalidRuleType: string;
            invalidCidr: string;
            conflict: string;
            notFound: string;
            selfLock: string;
          };
          throttle: { invalidUnlockTarget: string };
          role: {
            codeInvalid: string;
            codeExists: string;
            codeImmutable: string;
            notFound: string;
            seededProtected: string;
            inUse: string;
            cannotDeleteSelfRole: string;
            cannotDisableSelfRole: string;
            superCannotDisable: string;
            nameRequired: string;
            protectedRevoke: string;
            protectedGrant: string;
          };
          menu: {
            notFound: string;
            routeNameExists: string;
            routeNameImmutable: string;
            menuTypeImmutable: string;
            parentNotFound: string;
            cycleDetected: string;
            protectedMenu: string;
            constantParent: string;
            nameRequired: string;
            routeNameInvalid: string;
            hrefInvalid: string;
            buttonsInvalid: string;
            hasChildren: string;
            restoreConflict: string;
            protectedButtonRemove: string;
          };
          policy: {
            notRestorable: string;
          };
          user: {
            notFound: string;
            userNameInvalid: string;
            userNameExists: string;
            userNameImmutable: string;
            userEmailInvalid: string;
            userEmailExists: string;
            roleNotFound: string;
            seededProtected: string;
            superCannotDisable: string;
            cannotEditSelfRoleOrStatus: string;
            passwordPolicy: string;
            cannotDeleteSelf: string;
            cannotKickSelf: string;
            cannotResetSelfPassword: string;
            sessionPolicyInvalid: string;
            pwdSetTooFrequent: string;
            passwordConfirmMismatch: string;
            changePasswordThrottled: string;
            oldPasswordMismatch: string;
            passwordSameAsOld: string;
          };
          audit: { invalidTable: string; purgeBelowFloor: string };
        };
      };
      // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 003-auth-session END]
      system: {
        title: string;
        updateTitle: string;
        updateContent: string;
        updateConfirm: string;
        updateCancel: string;
      };
      common: {
        action: string;
        add: string;
        addSuccess: string;
        backToHome: string;
        batchDelete: string;
        cancel: string;
        close: string;
        check: string;
        selectAll: string;
        expandColumn: string;
        columnSetting: string;
        config: string;
        confirm: string;
        delete: string;
        deleteSuccess: string;
        confirmDelete: string;
        edit: string;
        warning: string;
        error: string;
        index: string;
        keywordSearch: string;
        logout: string;
        logoutConfirm: string;
        lookForward: string;
        modify: string;
        modifySuccess: string;
        noData: string;
        operate: string;
        pleaseCheckValue: string;
        refresh: string;
        reset: string;
        search: string;
        switch: string;
        tip: string;
        trigger: string;
        update: string;
        updateSuccess: string;
        userCenter: string;
        yesOrNo: {
          yes: string;
          no: string;
        };
      };
      request: {
        logout: string;
        logoutMsg: string;
        logoutWithModal: string;
        logoutWithModalMsg: string;
        refreshToken: string;
        tokenExpired: string;
      };
      theme: {
        themeDrawerTitle: string;
        tabs: {
          appearance: string;
          layout: string;
          general: string;
          preset: string;
        };
        appearance: {
          themeSchema: { title: string } & Record<UnionKey.ThemeScheme, string>;
          grayscale: string;
          colourWeakness: string;
          themeColor: {
            title: string;
            followPrimary: string;
          } & Record<Theme.ThemeColorKey, string>;
          recommendColor: string;
          recommendColorDesc: string;
          themeRadius: {
            title: string;
          };
          preset: {
            title: string;
            apply: string;
            applySuccess: string;
            [key: string]:
              | {
                  name: string;
                  desc: string;
                }
              | string;
          };
        };
        layout: {
          layoutMode: { title: string } & Record<UnionKey.ThemeLayoutMode, string> & {
              [K in `${UnionKey.ThemeLayoutMode}_detail`]: string;
            };
          tab: {
            title: string;
            visible: string;
            cache: string;
            cacheTip: string;
            height: string;
            mode: { title: string } & Record<UnionKey.ThemeTabMode, string>;
            closeByMiddleClick: string;
            closeByMiddleClickTip: string;
          };
          header: {
            title: string;
            height: string;
            breadcrumb: {
              visible: string;
              showIcon: string;
            };
          };
          sider: {
            title: string;
            inverted: string;
            width: string;
            collapsedWidth: string;
            mixWidth: string;
            mixCollapsedWidth: string;
            mixChildMenuWidth: string;
            autoSelectFirstMenu: string;
            autoSelectFirstMenuTip: string;
          };
          footer: {
            title: string;
            visible: string;
            fixed: string;
            height: string;
            right: string;
          };
          content: {
            title: string;
            scrollMode: { title: string; tip: string } & Record<UnionKey.ThemeScrollMode, string>;
            page: {
              animate: string;
              mode: { title: string } & Record<UnionKey.ThemePageAnimateMode, string>;
            };
            fixedHeaderAndTab: string;
          };
        };
        general: {
          title: string;
          watermark: {
            title: string;
            visible: string;
            text: string;
            enableUserName: string;
            enableTime: string;
            timeFormat: string;
          };
          multilingual: {
            title: string;
            visible: string;
          };
          globalSearch: {
            title: string;
            visible: string;
          };
        };
        configOperation: {
          copyConfig: string;
          copySuccessMsg: string;
          resetConfig: string;
          resetSuccessMsg: string;
        };
      };
      route: Record<I18nRouteKey, string>;
      page: {
        login: {
          common: {
            loginOrRegister: string;
            userNamePlaceholder: string;
            phonePlaceholder: string;
            codePlaceholder: string;
            passwordPlaceholder: string;
            confirmPasswordPlaceholder: string;
            codeLogin: string;
            confirm: string;
            back: string;
            validateSuccess: string;
            loginSuccess: string;
            welcomeBack: string;
          };
          pwdLogin: {
            title: string;
            rememberMe: string;
            forgetPassword: string;
            register: string;
            otherAccountLogin: string;
            otherLoginMode: string;
            superAdmin: string;
            admin: string;
            user: string;
          };
          codeLogin: {
            title: string;
            getCode: string;
            reGetCode: string;
            sendCodeSuccess: string;
            imageCodePlaceholder: string;
          };
          register: {
            title: string;
            agreement: string;
            protocol: string;
            policy: string;
          };
          resetPwd: {
            title: string;
          };
          bindWeChat: {
            title: string;
          };
        };
        about: {
          title: string;
          introduction: string;
          projectInfo: {
            title: string;
            version: string;
            latestBuildTime: string;
            githubLink: string;
            previewLink: string;
          };
          prdDep: string;
          devDep: string;
        };
        // [rev6-inline BASE-WEB-I18N-WIRING(i)+ 007-user-password-admin START] `page.passwordPolicy` 型節（違規碼八枚＋分隔符；逐鍵鏡像三語 locale 同名子樹）。
        // 請求層明細轉譯與即時密碼規則 hook 共用之單一命名空間（ADR-00076）；插在 `about` 與 `home` 之間：前後皆為未改的基線行
        passwordPolicy: {
          violation: {
            minLength: string;
            maxLength: string;
            maxBytes: string;
            requireDigit: string;
            requireLowercase: string;
            requireUppercase: string;
            requireSpecial: string;
            forbidUsername: string;
          };
          listSeparator: string;
        };
        // [rev6-inline BASE-WEB-I18N-WIRING(i)+ 007-user-password-admin END]
        home: {
          branchDesc: string;
          greeting: string;
          weatherDesc: string;
          projectCount: string;
          todo: string;
          message: string;
          downloadCount: string;
          registerCount: string;
          schedule: string;
          study: string;
          work: string;
          rest: string;
          entertainment: string;
          visitCount: string;
          turnover: string;
          dealCount: string;
          projectNews: {
            title: string;
            moreNews: string;
            desc1: string;
            desc2: string;
            desc3: string;
            desc4: string;
            desc5: string;
          };
          creativity: string;
        };
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin START] `page.userCenter` 型節（個人中心「修改密碼」卡之文案；逐鍵鏡像三語 locale 同名子樹）。
        // 不設頁標題鍵：個人中心頁之標題沿用既有路由標題鍵 `route['user-center']`；插在 `home` 與 `function` 之間：前後皆為未改的基線行
        userCenter: {
          password: {
            title: string;
            oldPassword: string;
            newPassword: string;
            confirmPassword: string;
            submit: string;
            success: string;
            hint: string;
          };
        };
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin END]
        function: {
          tab: {
            tabOperate: {
              title: string;
              addTab: string;
              addTabDesc: string;
              closeTab: string;
              closeCurrentTab: string;
              closeAboutTab: string;
              addMultiTab: string;
              addMultiTabDesc1: string;
              addMultiTabDesc2: string;
            };
            tabTitle: {
              title: string;
              changeTitle: string;
              change: string;
              resetTitle: string;
              reset: string;
            };
          };
          multiTab: {
            routeParam: string;
            backTab: string;
          };
          toggleAuth: {
            toggleAccount: string;
            authHook: string;
            superAdminVisible: string;
            adminVisible: string;
            adminOrUserVisible: string;
          };
          request: {
            repeatedErrorOccurOnce: string;
            repeatedError: string;
            repeatedErrorMsg1: string;
            repeatedErrorMsg2: string;
          };
        };
        alova: {
          scenes: {
            captchaSend: string;
            autoRequest: string;
            visibilityRequestTips: string;
            pollingRequestTips: string;
            networkRequestTips: string;
            refreshTime: string;
            startRequest: string;
            stopRequest: string;
            requestCrossComponent: string;
            triggerAllRequest: string;
          };
        };
        proNaive: {
          form: {
            basic: {
              title: string;
              appName: string;
              appStatus: string;
              createTime: string;
              responseDate: string;
              specificationInfo: string;
              specificate: string;
              specificationName: string;
              specificationValue: string;
              specificationColorRed: string;
              specificationColorOrange: string;
              addSpecificateItem: string;
              fillValue: string;
              reset: string;
              submit: string;
              add: string;
              delete: string;
              color: string;
              normal: string;
              anomaly: string;
            };
            query: {
              title1: string;
              title2: string;
              appName: string;
              appStatus: string;
              createTime: string;
              responseDate: string;
              endDate: string;
              field: string;
            };
            step: {
              title: string;
              step1: {
                title: string;
                field: string;
                nextStep: string;
              };
              step2: {
                title: string;
                field: string;
                prevStep: string;
                submit: string;
              };
            };
          };
          table: {
            remote: {
              filterCondition: string;
              name: string;
              createTime: string;
              responseTime: string;
              title: string;
              replicableText: string;
              tags: string;
              dateFormatting: string;
              image: string;
            };
            rowEdit: {
              title: string;
              reset: string;
              submit: string;
              edit: string;
              delete: string;
              save: string;
              task: string;
              score: string;
              time: string;
              name: string;
              action: string;
            };
          };
        };
        manage: {
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ix)+ 008-audit-settings-pages START] `page.manage.systemSettings` 型節（逐鍵鏡像三語 locale 同名子樹）——系統設定頁之組標題、
          // 16 鍵 label／help、三對矛盾提示與唯讀標示皆經本節過 `$t` 鍵型檢查；`item` 之鍵＝rust-api `server/src/validation.rs` 之 `REGISTRY` 逐鍵（snake_case 原樣）
          systemSettings: {
            group: { password: string; session: string; ip: string; account: string };
            item: {
              password_min_length: { label: string; help: string };
              password_max_length: { label: string; help: string };
              password_require_lowercase: { label: string; help: string };
              password_require_uppercase: { label: string; help: string };
              password_require_digit: { label: string; help: string };
              password_require_special: { label: string; help: string };
              password_forbid_username: { label: string; help: string };
              password_change_min_interval: { label: string; help: string };
              single_session_default: { label: string; help: string };
              session_idle_timeout: { label: string; help: string };
              ip_window_minutes: { label: string; help: string };
              ip_max_fails: { label: string; help: string };
              ip_captcha_after: { label: string; help: string };
              login_throttle_window_minutes: { label: string; help: string };
              login_throttle_max_fails: { label: string; help: string };
              login_throttle_captcha_after: { label: string; help: string };
            };
            conflict: { password: string; account: string; ip: string };
            readonlyTag: string;
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ix)+ 008-audit-settings-pages END]
          common: {
            status: {
              enable: string;
              disable: string;
            };
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] `page.manage.ipRule` 型節（逐鍵鏡像三語 locale 同名子樹）。
          // `page` 是逐鍵手寫的型樹（不像 `route` 由 RouteKey 自動推得）：不補本節，頁面內每一處 `$t('page.manage.ipRule.…')` 都過不了 typecheck。
          ipRule: {
            title: string;
            wbipCidr: string;
            wbipType: string;
            wbipMemo: string;
            order: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            updatedBy: string;
            statusActive: string;
            statusDeleted: string;
            statusAll: string;
            addIpRule: string;
            editIpRule: string;
            restore: string;
            confirmRestore: string;
            restoreSuccess: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vii)+ 007-user-password-admin START] `page.manage.ipRule.unlock` 型節（逐鍵鏡像三語 locale；巢狀於上方 (i) 塊內）——
            // 「解鎖來源 IP」鈕與彈窗之 $t 呼叫皆經本節過 typecheck，三語 locale 任一檔多出或缺少即紅
            unlock: {
              title: string;
              ipAddress: string;
              success: string;
            };
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vii)+ 007-user-password-admin END]
            ruleTypeMap: {
              allow: string;
              deny: string;
            };
            form: {
              wbipCidr: string;
              wbipType: string;
              status: string;
              cidr: string;
              type: string;
              memo: string;
              order: string;
            };
            empty: string;
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
          role: {
            title: string;
            roleName: string;
            roleCode: string;
            roleStatus: string;
            roleDesc: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] `page.manage.role.roleMemo` 型節（逐鍵鏡像三語 locale）；
            // 三語 locale 皆以本型標註，任一檔多出或缺少此鍵即 typecheck 紅
            roleMemo: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
            form: {
              roleName: string;
              roleCode: string;
              roleStatus: string;
              // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] `page.manage.role.form.roleMemo` 型節（同上）
              roleMemo: string;
              // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
              roleDesc: string;
            };
            addRole: string;
            editRole: string;
            menuAuth: string;
            buttonAuth: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] `page.manage.role.endpointAuth` 的型（角色抽屜第三鈕與端點權限彈窗標題所用）；
            // 三語 locale 以 `App.I18n.Schema` 標型，一語漏插即缺必填鍵、多插即多餘屬性，typecheck 皆紅。接在本型節末項 `buttonAuth` 之後：
            // 型成員以分號收尾、上一行不必改，塊內零移除行
            endpointAuth: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
          };
          user: {
            title: string;
            userName: string;
            userGender: string;
            nickName: string;
            userPhone: string;
            userEmail: string;
            userStatus: string;
            userRole: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] `page.manage.user` 接真補鍵之型節（清單新欄、回收桶開關與復原確認、
            // 角色欄分隔符、停用角色之灰色選項標籤、候選讀取失敗提示、會話政策三值與提示、設密提示、踢除三鍵、重設密碼浮層四鍵與隨機密碼、產密浮層七鍵、
            // 解鎖登入三鍵；鍵名沿 rev5:src/locales/langs/zh-cn.ts 同名鍵，roleSeparator／roleDisabledTag／unlockLoginConfirm／unlockLoginSuccess 為 007 刀新鍵）。
            // 三語 locale 皆以 `App.I18n.Schema` 標型：任一語缺鍵或多鍵即 typecheck 紅。插在 `userRole` 與 `form` 之間：前後皆為未改的基線行、塊內零移除行
            password: string;
            roles: string;
            roleSeparator: string;
            sessionPolicy: string;
            userMemo: string;
            createdAt: string;
            createdBy: string;
            updatedAt: string;
            updatedBy: string;
            showDeleted: string;
            restore: string;
            confirmRestore: string;
            restoreHint: string;
            restoreSuccess: string;
            roleDisabledTag: string;
            roleOptionsUnavailable: string;
            sessionPolicyOption: {
              inherit: string;
              single: string;
              multi: string;
            };
            sessionPolicyHint: string;
            passwordHint: string;
            kick: string;
            confirmKick: string;
            kickSuccess: string;
            resetPwd: string;
            resetPwdTitle: string;
            newPassword: string;
            resetPwdSuccess: string;
            randomPassword: string;
            pwdGen: {
              title: string;
              length: string;
              generate: string;
              copy: string;
              copied: string;
              copyFailed: string;
              apply: string;
            };
            unlockLogin: string;
            unlockLoginConfirm: string;
            unlockLoginSuccess: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
            form: {
              userName: string;
              userGender: string;
              nickName: string;
              userPhone: string;
              userEmail: string;
              userStatus: string;
              // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 抽屜新增欄（設密、記事）之輸入提示兩鍵的型；
              // 插在 `userStatus` 與末項 `userRole` 之間（與三語 locale 同位）
              password: string;
              userMemo: string;
              // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
              userRole: string;
            };
            addUser: string;
            editUser: string;
            gender: {
              male: string;
              female: string;
            };
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] `page.manage.policyArchive` 的型節（逐鍵鏡像三語 locale 同名子樹）。
          // 本節必需：`page` 是逐鍵手寫的型樹，缺此節則回收桶頁每一處 `$t('page.manage.policyArchive.…')` 都過不了 typecheck、三語多插的子樹也成多餘屬性。
          // 落在 `user` 與 `menu` 之間：若接在 `role` 之後，與上方端點權限型那塊只隔一行 `};`（塊末行 `};` 與這行同形，difflib 最長匹配會把基線那行對到塊末、隔離行歸入新增），會併成同一變更塊而拔標記不紅
          policyArchive: {
            title: string;
            sourceRole: string;
            dimension: string;
            target: string;
            archiveReason: string;
            archivedAt: string;
            archivedBy: string;
            restore: string;
            confirmRestore: string;
            restoreSuccess: string;
            form: {
              sourceRole: string;
              dimension: string;
            };
            dimensionLabel: {
              menu: string;
              button: string;
              endpoint: string;
            };
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
          menu: {
            home: string;
            title: string;
            id: string;
            parentId: string;
            menuType: string;
            menuName: string;
            routeName: string;
            routePath: string;
            pathParam: string;
            layout: string;
            page: string;
            i18nKey: string;
            icon: string;
            localIcon: string;
            iconTypeTitle: string;
            order: string;
            constant: string;
            keepAlive: string;
            href: string;
            hideInMenu: string;
            activeMenu: string;
            multiTab: string;
            fixedIndexInTab: string;
            query: string;
            button: string;
            buttonCode: string;
            buttonDesc: string;
            menuStatus: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] `page.manage.menu` 備註欄標籤與回收桶四鍵的型節（逐鍵鏡像三語 locale）；
            // 三語 locale 皆以本型標註，任一檔多出或缺少這些鍵即 typecheck 紅
            menuMemo: string;
            showDeleted: string;
            restore: string;
            confirmRestore: string;
            restoreSuccess: string;
            // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
            form: {
              home: string;
              menuType: string;
              menuName: string;
              routeName: string;
              routePath: string;
              pathParam: string;
              layout: string;
              page: string;
              i18nKey: string;
              icon: string;
              localIcon: string;
              order: string;
              keepAlive: string;
              href: string;
              hideInMenu: string;
              activeMenu: string;
              multiTab: string;
              fixedInTab: string;
              fixedIndexInTab: string;
              queryKey: string;
              queryValue: string;
              button: string;
              buttonCode: string;
              buttonDesc: string;
              // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] `page.manage.menu.form` 備註輸入提示與父選擇器頂層標籤的型節（同上）
              menuMemo: string;
              parentRoot: string;
              // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
              menuStatus: string;
            };
            addMenu: string;
            editMenu: string;
            addChildMenu: string;
            type: {
              directory: string;
              menu: string;
            };
            iconType: {
              iconify: string;
              local: string;
            };
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(x)+ 008-audit-settings-pages START] `page.manage.audit` 型節（逐鍵鏡像三語 locale 同名子樹）——稽核頁之分頁、搜尋卡、
          // 欄標題、快照浮層、清理浮層與兩則告示皆經本節過 `$t` 鍵型檢查。接在本型樹末項 `menu` 之後：型成員以分號收尾、上一行不必改。不接在 `role` 之後：
          // 該處與上方端點權限型那塊只隔一行 `};`（本塊末行 `};` 與之同形，difflib 最長匹配會把基線那行對到塊末），會併成同一變更塊而拔標記不紅
          audit: {
            title: string;
            tab: { operation: string; access: string; login: string; session: string };
            search: {
              operatorId: string;
              operatorName: string;
              userId: string;
              timeRange: string;
              placeholder: {
                entityTable: string;
                operation: string;
                operatorId: string;
                operatorName: string;
                httpMethod: string;
                httpStatus: string;
                httpPath: string;
                attemptedUserName: string;
                success: string;
                realIp: string;
                userId: string;
                userName: string;
                eventType: string;
                reason: string;
                timeRange: string;
              };
            };
            column: {
              createTime: string;
              operator: string;
              operation: string;
              entityTable: string;
              entityId: string;
              snapshot: string;
              realIp: string;
              xForwardedFor: string;
              region: string;
              traceId: string;
              httpMethod: string;
              httpPath: string;
              httpStatus: string;
              attemptedUserName: string;
              success: string;
              successOption: { true: string; false: string };
              user: string;
              sid: string;
              eventType: string;
              reason: string;
              sourceIp: string;
            };
            snapshot: { entry: string; title: string; before: string; after: string; empty: string };
            purge: {
              entry: string;
              title: string;
              days: string;
              daysHint: string;
              warning: string;
              confirm: string;
              success: string;
            };
            notice: { access: string; login: string };
          };
          // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(x)+ 008-audit-settings-pages END]
        };
      };
      form: {
        required: string;
        userName: FormMsg;
        phone: FormMsg;
        pwd: FormMsg;
        confirmPwd: FormMsg;
        code: FormMsg;
        email: FormMsg;
      };
      dropdown: Record<Global.DropdownKey, string>;
      icon: {
        themeConfig: string;
        themeSchema: string;
        lang: string;
        fullscreen: string;
        fullscreenExit: string;
        reload: string;
        collapse: string;
        expand: string;
        pin: string;
        unpin: string;
      };
      datatable: {
        itemCount: string;
        fixed: {
          left: string;
          right: string;
          unFixed: string;
        };
      };
    };

    type GetI18nKey<T extends Record<string, unknown>, K extends keyof T = keyof T> = K extends string
      ? T[K] extends Record<string, unknown>
        ? `${K}.${GetI18nKey<T[K]>}`
        : K
      : never;

    type I18nKey = GetI18nKey<Schema>;

    type TranslateOptions<Locales extends string> = import('vue-i18n').TranslateOptions<Locales>;

    interface $T {
      (key: I18nKey): string;
      (key: I18nKey, plural: number, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, defaultMsg: string, options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], options?: TranslateOptions<I18nKey>): string;
      (key: I18nKey, list: unknown[], plural: number): string;
      (key: I18nKey, list: unknown[], defaultMsg: string): string;
      (key: I18nKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string;
      (key: I18nKey, named: Record<string, unknown>, plural: number): string;
      (key: I18nKey, named: Record<string, unknown>, defaultMsg: string): string;
    }
  }

  /** Service namespace */
  namespace Service {
    /** Other baseURL key */
    type OtherBaseURLKey = 'demo';

    interface ServiceConfigItem {
      /** The backend service base url */
      baseURL: string;
      /** The proxy pattern of the backend service base url */
      proxyPattern: string;
    }

    interface OtherServiceConfigItem extends ServiceConfigItem {
      key: OtherBaseURLKey;
    }

    /** The backend service config */
    interface ServiceConfig extends ServiceConfigItem {
      /** Other backend service config */
      other: OtherServiceConfigItem[];
    }

    interface SimpleServiceConfig extends Pick<ServiceConfigItem, 'baseURL'> {
      other: Record<OtherBaseURLKey, string>;
    }

    /** The backend service response data */
    type Response<T = unknown> = {
      /** The backend service response code */
      code: string;
      /** The backend service response message */
      msg: string;
      /** The backend service response data */
      data: T;
    };

    /** The demo backend service response data */
    type DemoResponse<T = unknown> = {
      /** The backend service response code */
      status: string;
      /** The backend service response message */
      message: string;
      /** The backend service response data */
      result: T;
    };
  }
}
