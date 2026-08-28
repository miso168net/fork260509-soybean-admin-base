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

    type LangType = 'en-US' | 'zh-CN';

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
      // [rev5-inline BASE-WEB-I18N-WIRING(iii)+ 003-auth-session START] 頂層 backend 必填型節
      // （映射 wire msg key → 在地化；逐鍵鏡像 locale backend 樹 **53 鍵**＝003-auth-session
      // 之 22 鍵＋004-ip-trust-anchor 之 biz.ipRule.* 五鍵與 biz.throttle.* 一鍵＋
      // 005-role-menu-crud 之 biz.role.* 十鍵與 biz.menu.* 十二鍵＋006-authz-governance 之 biz.role.* 兩鍵與
      // biz.policy.* 一鍵——各刀的單一權威＝該刀 contracts/msg-keys.md）。★必填（非 optional）＝en-us.ts／
      // zh-cn.ts 缺樹即 typecheck 紅——兩語結構自此由型別免費守（msg-keys.md 機器閘表）。
      // rev4: 承 rev4 app.d.ts I18N-WIRING(iii) backend 型節同形、只取 003 那刀的 22 鍵射程；
      // ★LangType 擴充／locale 註冊／zh-tw.ts 標型重構不帶回（R3-15、仍延前端 UI 刀）。
      backend: {
        common: {
          success: string;
          // 白名單鍵（後端恆不發）：明細清單在地化分隔符（translateDetailValue join 用）
          listSeparator: string;
        };
        system: {
          internal: string;
          notFound: string;
          forbidden: string;
        };
        auth: {
          login: {
            failed: string;
          };
          session: {
            reLogin: string;
            kicked: string;
            kickedByAdmin: string;
          };
          token: {
            expired: string;
          };
        };
        biz: {
          auth: {
            notSupported: string;
            captchaRequired: string;
            locked: string;
          };
          // 004-ip-trust-anchor T038 五鍵（單一權威＝
          // specs/004-ip-trust-anchor/contracts/msg-keys.md）
          ipRule: {
            invalidRuleType: string;
            invalidCidr: string;
            conflict: string;
            notFound: string;
            selfLock: string;
          };
          // 005-role-menu-crud T026 十一鍵＋T031 一鍵（restoreConflict＝回收桶復原撞
          // 活性同鍵；單一權威＝specs/005-role-menu-crud/contracts/msg-keys.md）
          menu: {
            notFound: string;
            routeNameExists: string;
            routeNameImmutable: string;
            menuTypeImmutable: string;
            parentNotFound: string;
            cycleDetected: string;
            hasChildren: string;
            protectedMenu: string;
            constantParent: string;
            nameRequired: string;
            routeNameInvalid: string;
            restoreConflict: string;
          };
          // 006-authz-governance T023 一鍵（單一權威＝
          // specs/006-authz-governance/contracts/msg-keys.md）
          policy: {
            notRestorable: string;
          };
          // 005-role-menu-crud T020 九鍵（單一權威＝
          // specs/005-role-menu-crud/contracts/msg-keys.md）
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
          systemSettings: {
            invalidValue: string;
            notFound: string;
          };
          // 004-ip-trust-anchor T054 一鍵（單一權威＝
          // specs/004-ip-trust-anchor/contracts/msg-keys.md）——★本子節此前不存在、
          // 隨解鎖端點整節新增；缺型節則兩語 locale 標型失敗、pnpm typecheck 紅。
          throttle: {
            invalidUnlockTarget: string;
          };
          // 白名單八鍵（後端恆不發）：密碼政策違規碼逐碼譯文（translateDetailValue 消費）
          user: {
            // 後端實發十二鍵（US1 七支管理端點十一鍵＋本刀 U3 之 cannotKickSelf；
            // 譯文權威＝contracts/msg-keys.md）
            notFound: string;
            userNameExists: string;
            userNameInvalid: string;
            userNameImmutable: string;
            userEmailExists: string;
            userEmailInvalid: string;
            seededProtected: string;
            superCannotDisable: string;
            cannotDeleteSelf: string;
            cannotKickSelf: string;
            cannotEditSelfRoleOrStatus: string;
            roleNotFound: string;
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
          };
        };
      };
      // [rev5-inline BASE-WEB-I18N-WIRING(iii)+ 003-auth-session END]
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
          common: {
            status: {
              enable: string;
              disable: string;
            };
          };
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START]
          // `page.manage.ipRule` 型節（逐鍵鏡像兩語 locale）。★本節**必需、非「如需」**：
          // `page:` 是顯式型樹，少一鍵就是 `$t('page.manage.ipRule.…')` 型別檢查紅
          // （對比 `route:` 樹型為 `Record<I18nRouteKey, string>`、鍵集自路由產物自動導出）。
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
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
          role: {
            title: string;
            roleName: string;
            roleCode: string;
            roleStatus: string;
            roleDesc: string;
            // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START]
            // `page.manage.role.roleMemo` 欄標籤鍵型節（逐鍵鏡像兩語 locale；page: 為顯式型樹、
            // 少鍵即 $t 型別檢查紅——同 (i) 用途的既有論證）
            roleMemo: string;
            // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
            form: {
              roleName: string;
              roleCode: string;
              roleStatus: string;
              roleDesc: string;
              // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] memo placeholder 型節
              roleMemo: string;
              // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
            };
            addRole: string;
            editRole: string;
            menuAuth: string;
            buttonAuth: string;
            // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START]
            // `page.manage.role.endpointAuth` 型節（逐鍵鏡像兩語 locale；page: 為顯式型樹、
            // 少鍵即 $t 型別檢查紅——同 (i)(ii) 用途的既有論證）
            endpointAuth: string;
            // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
          };
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START]
          // `page.manage.policyArchive` 型節（逐鍵鏡像兩語 locale、15 葉鍵）。★本節**必需、非「如需」**：
          // `page:` 是顯式型樹，少一鍵就是 `$t('page.manage.policyArchive.…')` 型別檢查紅
          // （同 (i) 用途的既有論證）。
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
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
          user: {
            title: string;
            userName: string;
            userGender: string;
            nickName: string;
            userPhone: string;
            userEmail: string;
            userStatus: string;
            userRole: string;
            form: {
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
            // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START]
            // `page.manage.menu.menuMemo` 欄標籤鍵＋回收桶 toggle 四鍵型節（U12；逐鍵鏡像
            // 兩語 locale；page: 為顯式型樹、少鍵即 $t 型別檢查紅——同 role.roleMemo 的既有論證）
            menuMemo: string;
            showDeleted: string;
            restore: string;
            confirmRestore: string;
            restoreSuccess: string;
            // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
              // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] memo placeholder
              // ＋父選擇器「頂層」合成選項標籤型節
              menuMemo: string;
              parentRoot: string;
              // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
