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

    // [rev4-inline I18N-WIRING(iv) 004-system-settings] 原行: type LangType = 'en-US' | 'zh-CN';
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
      // [rev4-inline I18N-WIRING(iii) 004-system-settings START] top-level backend 命名空間型（映射 wire msg → 在地化）
      backend: {
        common: {
          // [rev4-inline I18N-WIRING(iii) 011-user-admin] 明細清單在地化分隔符型（passwordPolicy violations join 用；T024）
          listSeparator: string;
          success: string;
        };
        // [rev4-inline I18N-WIRING(iii) 005-auth-login] auth 命名空間型（逐鍵鏡像 locale）
        auth: {
          login: {
            failed: string;
            locked: string;
            captchaRequired: string;
          };
          token: {
            expired: string;
          };
          session: {
            reLogin: string;
            kicked: string;
          };
        };
        biz: {
          systemSettings: {
            notFound: string;
            invalidValue: string;
          };
          // [rev4-inline I18N-WIRING(iii) 005-auth-login] biz.auth 型（逐鍵鏡像 locale）
          auth: {
            notSupported: string;
            // [rev4-inline I18N-WIRING(iii) 015-pwd-custody] pwd_gate_mw 硬閘拒因型（逐鍵鏡像 locale；scalar）
            mustChangePassword: string;
          };
          // [rev4-inline I18N-WIRING(iii) 009-role-admin] biz.role/policy 拒因型（逐鍵鏡像 locale；ADR 0050）
          role: {
            seededProtected: string;
            inUse: string;
            cannotDeleteSelfRole: string;
            cannotDisableSelfRole: string;
            superCannotDisable: string;
            codeImmutable: string;
            codeExists: string;
            codeInvalid: string;
            notFound: string;
            protectedRevoke: string;
          };
          // [rev4-inline I18N-WIRING(iii) 010-menu-admin] biz.menu 拒因型十鍵（逐鍵鏡像 locale；皆 scalar；R9／ADR 0050）
          menu: {
            protectedMenu: string;
            hasChildren: string;
            routeNameImmutable: string;
            menuTypeImmutable: string;
            routeNameExists: string;
            routeNameInvalid: string;
            parentNotFound: string;
            parentDeleted: string;
            cycleDetected: string;
            notFound: string;
          };
          // [rev4-inline I18N-WIRING(iii) 011-user-admin] biz.user 拒因 15 鍵＋passwordViolation 逐碼子鍵＋biz.unlock 2 鍵型（逐鍵鏡像 locale；ADR 0050/0054）
          user: {
            seededProtected: string;
            cannotDeleteSelf: string;
            cannotDisableSelf: string;
            cannotKickSelf: string;
            cannotChangeSelfRoles: string;
            superCannotDisable: string;
            superRoleProtected: string;
            userNameExists: string;
            userNameImmutable: string;
            userNameInvalid: string;
            // [rev4-inline I18N-WIRING(iii) 014-user-center] 自助改密拒因型 3 鍵（逐鍵鏡像 locale；皆 scalar）
            passwordMismatch: string;
            oldPasswordMismatch: string;
            passwordSameAsOld: string;
            passwordPolicy: string;
            passwordViolation: {
              minLength: string;
              maxLength: string;
              maxBytes: string;
              requireDigit: string;
              requireLowercase: string;
              requireUppercase: string;
              requireSpecial: string;
              forbidUsername: string;
            };
            roleNotFound: string;
            userNotFound: string;
            sessionPolicyInvalid: string;
            // [rev4-inline I18N-WIRING(iii) 015-pwd-custody] 設密冷卻拒因型（逐鍵鏡像 locale；攜 {remainingSeconds}）
            pwdSetTooFrequent: string;
          };
          unlock: {
            invalidTarget: string;
            invalidDimension: string;
          };
          // [rev4-inline I18N-WIRING(iii) 012-audit-admin] biz.audit 清理拒因型 2 鍵（逐鍵鏡像 locale；purgeBelowFloor 攜 {minDays}；ADR 0050）
          audit: {
            invalidTable: string;
            purgeBelowFloor: string;
          };
          policy: {
            notRestorable: string;
          };
          // [rev4-inline I18N-WIRING(iii) 013-ip-rule-admin] biz.ipRule 拒因型 5 鍵（逐鍵鏡像 locale；皆 scalar；data-model §6）
          ipRule: {
            selfLock: string;
            conflict: string;
            invalidCidr: string;
            invalidRuleType: string;
            notFound: string;
          };
        };
        system: {
          forbidden: string;
        };
      };
      // [rev4-inline I18N-WIRING(iii) 004-system-settings END]
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
          // [rev4-inline I18N-WIRING(iii) 004-system-settings START] 系統設定頁字串型（items＝per-key label、單元⑧延伸）
          systemSettings: {
            passwordPolicyTitle: string;
            sessionTitle: string;
            ipLoginTitle: string;
            accountLoginTitle: string;
            items: {
              passwordMinLength: string;
              passwordMaxLength: string;
              passwordRequireLowercase: string;
              passwordRequireUppercase: string;
              passwordRequireDigit: string;
              passwordRequireSpecial: string;
              passwordForbidUsername: string;
              singleSessionDefault: string;
              loginThrottleMaxFails: string;
              loginThrottleWindowMinutes: string;
              loginThrottleCaptchaAfter: string;
              ipMaxFails: string;
              ipWindowMinutes: string;
              ipCaptchaAfter: string;
              sessionIdleTimeout: string;
              // [rev4-inline I18N-WIRING(iii) 015-pwd-custody] 設密冷卻鍵標籤型（逐鍵鏡像 locale）
              passwordChangeMinInterval: string;
            };
            // B-059 tooltip 三語化：per-key help 說明型（與 locale help 逐鍵鏡像）
            help: {
              passwordMinLength: string;
              passwordMaxLength: string;
              passwordRequireLowercase: string;
              passwordRequireUppercase: string;
              passwordRequireDigit: string;
              passwordRequireSpecial: string;
              passwordForbidUsername: string;
              singleSessionDefault: string;
              sessionIdleTimeout: string;
              ipMaxFails: string;
              ipWindowMinutes: string;
              ipCaptchaAfter: string;
              loginThrottleMaxFails: string;
              loginThrottleWindowMinutes: string;
              loginThrottleCaptchaAfter: string;
              // [rev4-inline I18N-WIRING(iii) 015-pwd-custody] 設密冷卻鍵 tooltip 型（逐鍵鏡像 locale）
              passwordChangeMinInterval: string;
            };
          };
          // [rev4-inline I18N-WIRING(iii) 004-system-settings END]
          common: {
            status: {
              enable: string;
              disable: string;
            };
          };
          role: {
            title: string;
            roleName: string;
            roleCode: string;
            roleStatus: string;
            roleDesc: string;
            form: {
              roleName: string;
              roleCode: string;
              roleStatus: string;
              roleDesc: string;
            };
            addRole: string;
            editRole: string;
            menuAuth: string;
            buttonAuth: string;
            // [rev4-inline MODAL-WIRING(c) 009-role-admin] endpoint-auth-modal net-new key 型（逐鍵鏡像 locale）
            endpointAuth: string;
          };
          // [rev4-inline MODAL-WIRING(e) 009-role-admin START] 授權回收桶頁字串型（逐鍵鏡像 locale）
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
          // [rev4-inline MODAL-WIRING(e) 009-role-admin END]
          // [rev4-inline I18N-WIRING(iii) 012-audit-admin START] 稽核中心頁字串型（逐鍵鏡像 locale；四分頁＋清理對話框＋語意說明）
          audit: {
            title: string;
            tab: {
              operation: string;
              access: string;
              login: string;
              session: string;
            };
            common: {
              createTime: string;
              operator: string;
              operatorId: string;
              operatorName: string;
              realIp: string;
              region: string;
              traceId: string;
              timeRange: string;
            };
            operation: {
              entityTable: string;
              operation: string;
              entityId: string;
              payload: string;
              viewPayload: string;
              emptyPayload: string;
              payloadBefore: string;
              payloadAfter: string;
            };
            access: {
              httpMethod: string;
              httpStatus: string;
              httpPath: string;
            };
            login: {
              attemptedUserName: string;
              success: string;
              successOption: {
                true: string;
                false: string;
              };
              throttleNote: string;
            };
            session: {
              userId: string;
              userName: string;
              sid: string;
              eventType: string;
              reason: string;
              sourceIp: string;
            };
            form: {
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
            purge: {
              title: string;
              entry: string;
              beforeDays: string;
              beforeDaysHint: string;
              warning: string;
              confirm: string;
              success: string;
            };
          };
          // [rev4-inline I18N-WIRING(iii) 012-audit-admin END]
          // [rev4-inline I18N-WIRING(iii) 013-ip-rule-admin START] IP 規則頁清單面（T015）＋寫端面（T019）字串型（逐鍵鏡像 locale）
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
          // [rev4-inline I18N-WIRING(iii) 013-ip-rule-admin END]
          user: {
            title: string;
            userName: string;
            userGender: string;
            nickName: string;
            userPhone: string;
            userEmail: string;
            userStatus: string;
            userRole: string;
            // [rev4-inline I18N-WIRING(iii) 011-user-admin] user 頁維運動作＋回收桶＋drawer 控件＋解鎖 modal key 型（逐鍵鏡像 locale；T023）
            password: string;
            sessionPolicy: string;
            sessionPolicyOption: {
              inherit: string;
              single: string;
              multi: string;
            };
            kick: string;
            confirmKick: string;
            kickSuccess: string;
            resetPwd: string;
            resetPwdSuccess: string;
            resetPwdUnlockHint: string;
            // [rev4-inline (k) 015-pwd-custody] operate 欄「密碼」動作標籤＋確認句（逐鍵鏡像 locale）
            pwdAction: string;
            pwdActionConfirm: string;
            confirmRestore: string;
            deletedAt: string;
            unlock: {
              title: string;
              dimension: string;
              target: string;
              dimensionLabel: {
                user: string;
                ip: string;
              };
              success: string;
              form: {
                dimension: string;
                userName: string;
                target: string;
              };
            };
            form: {
              // [rev4-inline I18N-WIRING(iii) 011-user-admin] drawer add 密碼欄＋edit 會話策略 placeholder 型（T023）
              password: string;
              sessionPolicy: string;
              userName: string;
              userGender: string;
              nickName: string;
              userPhone: string;
              userEmail: string;
              userStatus: string;
              userRole: string;
            };
            addUser: string;
            editUser: string;
            gender: {
              male: string;
              female: string;
            };
          };
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
              menuStatus: string;
            };
            addMenu: string;
            editMenu: string;
            addChildMenu: string;
            // [rev4-inline (d) 010-menu-admin] 顯示已刪除 toggle＋復原確認 label（憲法 §III.2(d) 錨點；restore/restoreSuccess 復用 policyArchive、無需入 menu schema）
            showDeleted: string;
            confirmRestore: string;
            type: {
              directory: string;
              menu: string;
            };
            iconType: {
              iconify: string;
              local: string;
            };
          };
        };
        // [rev4-inline (g) 014-user-center START] 個人中心 self-service 頁型（29 承襲鍵＋D3 toast 鍵＋D2 pwdPolicyNotMet 鍵逐鍵鏡像 locale；v1.12.0 (g) 擴字串射程）
        userCenter: {
          title: string;
          basicInfoTitle: string;
          phoneTitle: string;
          emailTitle: string;
          passwordTitle: string;
          userName: string;
          roles: string;
          gender: string;
          nickName: string;
          userPhone: string;
          userEmail: string;
          save: string;
          createdAt: string;
          updatedAt: string;
          notModified: string;
          oldPassword: string;
          newPassword: string;
          confirmPassword: string;
          changePwdSuccessRevoked: string;
          pwdPolicyNotMet: string;
          origin: {
            systemCreated: string;
            adminCreated: string;
            systemUpdated: string;
            adminUpdated: string;
          };
          verify: {
            sendCode: string;
            codePlaceholder: string;
            verify: string;
            comingSoon: string;
            emailCode: string;
            phoneCode: string;
            backfillHint: string;
            // [rev4-inline (g) 020-email-verify-smtp] 信箱驗證流 UI 鍵型（逐鍵鏡像 locale；verified 帶 {time}、cooldown 帶 {seconds} 插值）
            verified: string;
            notVerified: string;
            unbind: string;
            unbindConfirm: string;
            captchaPlaceholder: string;
            cooldown: string;
            sendSuccess: string;
            verifySuccess: string;
          };
        };
        // [rev4-inline (g) 014-user-center END]
        // [rev4-inline (k) 015-pwd-custody START] 強制改密頁型（逐鍵鏡像 locale）
        forceChangePwd: {
          title: string;
          desc: string;
          success: string;
          logout: string;
        };
        // [rev4-inline (k) 015-pwd-custody END]
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
      // [rev4-inline (k) 015-pwd-custody START] 產密浮層共用元件型（逐鍵鏡像 locale；contracts C5 浮層 5 鍵）
      pwdGen: {
        title: string;
        generate: string;
        copy: string;
        copied: string;
        showPassword: string;
        apply: string;
      };
      // [rev4-inline (k) 015-pwd-custody END]
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
