const local: App.I18n.Schema = {
  // [rev5-inline BASE-WEB-I18N-WIRING(ii)+ 003-auth-session START] backend 命名空間（wire msg
  // key → 在地化顯示；**53 鍵**＝003-auth-session 之 22 鍵＋004-ip-trust-anchor 之
  // biz.ipRule.* 五鍵與 biz.throttle.* 一鍵＋005-role-menu-crud 之 biz.role.* 十鍵與
  // biz.menu.* 十二鍵＋006-authz-governance 之 biz.role.* 兩鍵與 biz.policy.* 一鍵；
  // 各刀新鍵的譯文單一權威＝該刀 contracts/msg-keys.md，
  // 其餘鍵照 rev4 鏡像重打字消化）。★下一行 `  backend: {` 須獨佔一行——本檔不在
  // MSG_DICT_LOCALES 字典鏈射程（B-030 子項）、結構由 App.I18n.Schema 必填型節＋typecheck 守。
  backend: {
    common: {
      success: '操作成功',
      // 白名單鍵（後端恆不發）：明細清單在地化分隔符（translateDetailValue join 用）
      listSeparator: '、'
    },
    system: {
      internal: '系统发生内部错误，请稍后再试',
      notFound: '找不到请求的资源',
      forbidden: '没有权限执行此操作'
    },
    auth: {
      login: {
        failed: '用户名或密码错误'
      },
      session: {
        reLogin: '请重新登录',
        kicked: '您的账号已在其他设备登录，当前会话已结束',
        kickedByAdmin: '此会话已被管理员结束，请重新登录'
      },
      token: {
        expired: '登录已过期，正在重新获取授权'
      }
    },
    biz: {
      auth: {
        notSupported: '该功能暂未开放',
        captchaRequired: '请完成验证码后再试',
        locked: '尝试次数过多，请稍后再试'
      },
      // 004-ip-trust-anchor T038 五鍵（譯文語意單一權威＝
      // specs/004-ip-trust-anchor/contracts/msg-keys.md）
      ipRule: {
        invalidRuleType: '规则类型不正确',
        invalidCidr: '网段格式不正确',
        conflict: '相同网段与类型的规则已存在',
        notFound: '找不到指定的规则，或其状态不允许此操作',
        selfLock: '此规则会使你当前的连接被阻断，已拒绝写入'
      },
      // 005-role-menu-crud T026 十一鍵＋T031 一鍵（鍵字面與譯文語意單一權威＝
      // specs/005-role-menu-crud/contracts/msg-keys.md；譯文照 rev4:zh-cn.ts biz.menu
      // 對應鍵消化、★parentNotFound 併鍵「不存在或已刪」——rev5 單鍵、rev4 兩鍵形不帶回；
      // constantParent／nameRequired／restoreConflict 為 rev5 新鍵、rev4 無對應
      // ——restoreConflict＝復原撞活性同鍵〔rev4 併 routeNameExists 形不帶回〕）
      menu: {
        notFound: '菜单不存在',
        routeNameExists: '路由名称已存在',
        routeNameImmutable: '路由名称创建后不可修改',
        menuTypeImmutable: '菜单类型创建后不可修改',
        parentNotFound: '父级菜单不存在或已删除',
        cycleDetected: '不可将菜单移至自身或其子孙之下',
        hasChildren: '菜单下尚有子项，请先处理子项',
        protectedMenu: '受保护菜单，不可删除',
        constantParent: '常量菜单仅能挂在常量父菜单之下',
        nameRequired: '菜单名称不能为空',
        routeNameInvalid: '路由名称格式不正确（仅允许字母、数字、下划线、连字符，最长 100 位）',
        restoreConflict: '同名路由已有生效菜单，无法恢复'
      },
      // 006-authz-governance T023 一鍵（鍵字面與譯文語意單一權威＝
      // specs/006-authz-governance/contracts/msg-keys.md；譯文照 rev4:zh-cn.ts
      // backend.biz.policy.notRestorable 同鍵消化）
      policy: {
        notRestorable: '该归档授权不可复原'
      },
      // 005-role-menu-crud T020 九鍵（鍵字面與譯文語意單一權威＝
      // specs/005-role-menu-crud/contracts/msg-keys.md；譯文照 rev4:zh-cn.ts biz.role
      // 對應鍵消化、★inUse 攜參形不帶回——rev5 純 key 零插值〔R2-9〕）
      role: {
        codeInvalid: '角色编码格式不正确（仅允许字母、数字、下划线，最长 64 位）',
        codeExists: '角色编码已存在',
        codeImmutable: '角色编码创建后不可修改',
        notFound: '角色不存在',
        seededProtected: '系统内置角色，不可删除',
        inUse: '该角色仍挂有用户，不可删除',
        cannotDeleteSelfRole: '不能删除当前登录用户所属的角色',
        cannotDisableSelfRole: '不能停用当前登录用户所属的角色',
        superCannotDisable: '超级管理员角色不可停用',
        nameRequired: '角色名称不能为空',
        protectedRevoke: '存在受保护的授权，无法撤销',
        protectedGrant: '受保护的端点仅限超级管理员持有'
      },
      systemSettings: {
        invalidValue: '设置值无效',
        notFound: '设置项不存在'
      },
      // 004-ip-trust-anchor T054 一鍵（譯文語意單一權威＝
      // specs/004-ip-trust-anchor/contracts/msg-keys.md）
      throttle: {
        invalidUnlockTarget: '解锁对象不正确'
      },
      // 白名單八鍵（後端恆不發）：密碼政策違規碼逐碼譯文（translateDetailValue 消費）
      user: {
        notFound: '用户不存在',
        userNameExists: '用户名已存在',
        userNameInvalid: '用户名格式不正确',
        userNameImmutable: '用户名不可修改',
        userEmailExists: '邮箱已被使用',
        userEmailInvalid: '邮箱格式不正确',
        seededProtected: '内置账号受保护',
        superCannotDisable: '超级管理员不可停用',
        cannotDeleteSelf: '不能删除自己',
        cannotKickSelf: '不能踢除自己',
        cannotEditSelfRoleOrStatus: '不能修改自己的角色或状态',
        roleNotFound: '角色不存在',
        cannotResetSelfPassword: '请到个人中心修改自己的密码',
        passwordConfirmMismatch: '两次输入的密码不一致',
        oldPasswordMismatch: '旧密码不正确',
        passwordSameAsOld: '新密码不能与旧密码相同',
        changePasswordThrottled: '尝试次数过多，请稍后再试',
        passwordPolicy: '密码不符合安全策略：{violations}',
        pwdSetTooFrequent: '密码设置过于频繁，请 {remainingSeconds} 秒后再试',
        passwordViolation: {
          minLength: '长度未达策略下限',
          maxLength: '长度超过策略上限',
          maxBytes: '字节数超过上限',
          requireDigit: '须包含数字',
          requireLowercase: '须包含小写字母',
          requireUppercase: '须包含大写字母',
          requireSpecial: '须包含特殊符号',
          forbidUsername: '不可与用户名相同'
        }
      }
    }
  },
  // [rev5-inline BASE-WEB-I18N-WIRING(ii)+ 003-auth-session END]
  system: {
    title: 'Soybean 管理系统',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回首页',
    batchDelete: '批量删除',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    selectAll: '全选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    confirm: '确认',
    delete: '删除',
    deleteSuccess: '删除成功',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    updateSuccess: '更新成功',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeDrawerTitle: '主题配置',
    tabs: {
      appearance: '外观',
      layout: '布局',
      general: '通用',
      preset: '预设'
    },
    appearance: {
      themeSchema: {
        title: '主题模式',
        light: '亮色模式',
        dark: '暗黑模式',
        auto: '跟随系统'
      },
      grayscale: '灰色模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主题颜色',
        primary: '主色',
        info: '信息色',
        success: '成功色',
        warning: '警告色',
        error: '错误色',
        followPrimary: '跟随主色'
      },
      themeRadius: {
        title: '主题圆角'
      },
      recommendColor: '应用推荐算法的颜色',
      recommendColorDesc: '推荐颜色的算法参照',
      preset: {
        title: '主题预设',
        apply: '应用',
        applySuccess: '预设应用成功',
        default: {
          name: '默认预设',
          desc: 'Soybean 默认主题预设'
        },
        dark: {
          name: '暗色预设',
          desc: '适用于夜间使用的暗色主题预设'
        },
        compact: {
          name: '紧凑型',
          desc: '适用于小屏幕的紧凑布局预设'
        },
        azir: {
          name: 'Azir的预设',
          desc: '是 Azir 比较喜欢的莫兰迪色系冷淡风'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '布局模式',
        vertical: '左侧菜单模式',
        'vertical-mix': '左侧菜单混合模式',
        'vertical-hybrid-header-first': '左侧混合-顶部优先',
        horizontal: '顶部菜单模式',
        'top-hybrid-sidebar-first': '顶部混合-侧边优先',
        'top-hybrid-header-first': '顶部混合-顶部优先',
        vertical_detail: '左侧菜单布局，菜单在左，内容在右。',
        'vertical-mix_detail': '左侧双菜单布局，一级菜单在左侧深色区域，二级菜单在左侧浅色区域。',
        'vertical-hybrid-header-first_detail':
          '左侧混合布局，一级菜单在顶部，二级菜单在左侧深色区域，三级菜单在左侧浅色区域。',
        horizontal_detail: '顶部菜单布局，菜单在顶部，内容在下方。',
        'top-hybrid-sidebar-first_detail': '顶部混合布局，一级菜单在左侧，二级菜单在顶部。',
        'top-hybrid-header-first_detail': '顶部混合布局，一级菜单在顶部，二级菜单在左侧。'
      },
      tab: {
        title: '标签栏设置',
        visible: '显示标签栏',
        cache: '标签栏信息缓存',
        cacheTip: '离开页面后仍然保留标签栏信息',
        height: '标签栏高度',
        mode: {
          title: '标签栏风格',
          slider: '滑块风格',
          chrome: '谷歌风格',
          button: '按钮风格'
        },
        closeByMiddleClick: '鼠标中键关闭标签页',
        closeByMiddleClickTip: '启用后可以使用鼠标中键点击标签页进行关闭'
      },
      header: {
        title: '头部设置',
        height: '头部高度',
        breadcrumb: {
          visible: '显示面包屑',
          showIcon: '显示面包屑图标'
        }
      },
      sider: {
        title: '侧边栏设置',
        inverted: '深色侧边栏',
        width: '侧边栏宽度',
        collapsedWidth: '侧边栏折叠宽度',
        mixWidth: '混合布局侧边栏宽度',
        mixCollapsedWidth: '混合布局侧边栏折叠宽度',
        mixChildMenuWidth: '混合布局子菜单宽度',
        autoSelectFirstMenu: '自动选择第一个子菜单',
        autoSelectFirstMenuTip: '点击一级菜单时，自动选择并导航到第一个子菜单的最深层级'
      },
      footer: {
        title: '底部设置',
        visible: '显示底部',
        fixed: '固定底部',
        height: '底部高度',
        right: '底部居右'
      },
      content: {
        title: '内容区域设置',
        scrollMode: {
          title: '滚动模式',
          tip: '主题滚动仅 main 部分滚动，外层滚动可携带头部底部一起滚动',
          wrapper: '外层滚动',
          content: '主体滚动'
        },
        page: {
          animate: '页面切换动画',
          mode: {
            title: '页面切换动画类型',
            'fade-slide': '滑动',
            fade: '淡入淡出',
            'fade-bottom': '底部消退',
            'fade-scale': '缩放消退',
            'zoom-fade': '渐变',
            'zoom-out': '闪现',
            none: '无'
          }
        },
        fixedHeaderAndTab: '固定头部和标签栏'
      }
    },
    general: {
      title: '通用设置',
      watermark: {
        title: '水印设置',
        visible: '显示全屏水印',
        text: '自定义水印文本',
        enableUserName: '启用用户名水印',
        enableTime: '显示当前时间',
        timeFormat: '时间格式'
      },
      multilingual: {
        title: '多语言设置',
        visible: '显示多语言按钮'
      },
      globalSearch: {
        title: '全局搜索设置',
        visible: '显示全局搜索按钮'
      }
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  route: {
    login: '登录',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    'iframe-page': '外链页面',
    home: '首页',
    document: '文档',
    document_project: '项目文档',
    'document_project-link': '项目文档(外链)',
    document_video: '视频教程',
    document_vue: 'Vue文档',
    document_vite: 'Vite文档',
    document_unocss: 'UnoCSS文档',
    document_naive: 'Naive UI文档',
    'document_pro-naive': 'Pro Naive UI文档',
    document_antd: 'Ant Design Vue文档',
    document_alova: 'Alova文档',
    'user-center': '个人中心',
    about: '关于',
    function: '系统功能',
    alova: 'alova示例',
    alova_request: 'alova请求',
    alova_scenes: '场景化请求',
    'pro-naive': 'Pro Naive UI 示例',
    'pro-naive_form': '表单',
    'pro-naive_form_basic': '基础表单',
    'pro-naive_form_query': '查询表单',
    'pro-naive_form_step': '分步表单',
    'pro-naive_table': '表格',
    'pro-naive_table_remote': '远程加载',
    'pro-naive_table_row-edit': '行编辑',
    function_tab: '标签页',
    'function_multi-tab': '多标签页',
    'function_hide-child': '隐藏子菜单',
    'function_hide-child_one': '隐藏子菜单',
    'function_hide-child_two': '菜单二',
    'function_hide-child_three': '菜单三',
    function_request: '请求',
    'function_toggle-auth': '切换权限',
    'function_super-page': '超级管理员可见',
    manage: '系统管理',
    manage_user: '用户管理',
    'manage_user-detail': '用户详情',
    manage_role: '角色管理',
    manage_menu: '菜单管理',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] route: 樹補
    // `manage_ip-rule` 一鍵——本樹型為 `Record<I18nRouteKey, string>`，路由外掛重算出該
    // RouteKey 後不補鍵即型別檢查紅（鍵名＝seed 選單列的 route_name，逐字不可改）。
    'manage_ip-rule': 'IP 规则管理',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] route: 樹補
    // `manage_policy-archive` 一鍵（鍵名＝seed 選單列 10 的 route_name，逐字不可改；
    // 路由外掛重算出該 RouteKey 後不補鍵即型別檢查紅——同 (i) 用途的既有論證）。
    'manage_policy-archive': '授权回收站',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
    'multi-menu': '多级菜单',
    'multi-menu_first': '菜单一',
    'multi-menu_first_child': '菜单一子菜单',
    'multi-menu_second': '菜单二',
    'multi-menu_second_child': '菜单二子菜单',
    'multi-menu_second_child_home': '菜单二子菜单首页',
    exception: '异常页',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    plugin: '插件示例',
    plugin_copy: '剪贴板',
    plugin_charts: '图表',
    plugin_charts_echarts: 'ECharts',
    plugin_charts_antv: 'AntV',
    plugin_charts_vchart: 'VChart',
    plugin_editor: '编辑器',
    plugin_editor_quill: '富文本编辑器',
    plugin_editor_markdown: 'MD 编辑器',
    plugin_icon: '图标',
    plugin_map: '地图',
    plugin_print: '打印',
    plugin_swiper: 'Swiper',
    plugin_video: '视频',
    plugin_barcode: '条形码',
    plugin_pinyin: '拼音',
    plugin_excel: 'Excel',
    plugin_pdf: 'PDF 预览',
    plugin_gantt: '甘特图',
    plugin_gantt_dhtmlx: 'dhtmlxGantt',
    plugin_gantt_vtable: 'VTableGantt',
    plugin_typeit: '打字机',
    plugin_tables: '表格',
    plugin_tables_vtable: 'VTable'
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登录 / 注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！'
      },
      pwdLogin: {
        title: '密码登录',
        rememberMe: '记住我',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherAccountLogin: '其他账号登录',
        otherLoginMode: '其他登录方式',
        superAdmin: '超级管理员',
        admin: '管理员',
        user: '普通用户'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》'
      },
      resetPwd: {
        title: '重置密码'
      },
      bindWeChat: {
        title: '绑定微信'
      }
    },
    about: {
      title: '关于',
      introduction: `SoybeanAdmin 是一个优雅且功能强大的后台管理模板，基于最新的前端技术栈，包括 Vue3, Vite7, TypeScript, Pinia 和 UnoCSS。它内置了丰富的主题配置和组件，代码规范严谨，实现了自动化的文件路由系统。此外，它还采用了基于 ApiFox 的在线Mock数据方案。SoybeanAdmin 为您提供了一站式的后台管理解决方案，无需额外配置，开箱即用。同样是一个快速学习前沿技术的最佳实践。`,
      projectInfo: {
        title: '项目信息',
        version: '版本',
        latestBuildTime: '最新构建时间',
        githubLink: 'Github 地址',
        previewLink: '预览地址'
      },
      prdDep: '生产依赖',
      devDep: '开发依赖'
    },
    home: {
      branchDesc:
        '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
      greeting: '早安，{userName}, 今天又是充满活力的一天!',
      weatherDesc: '今日多云转晴，20℃ - 25℃!',
      projectCount: '项目数',
      todo: '待办',
      message: '消息',
      downloadCount: '下载量',
      registerCount: '注册量',
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      visitCount: '访问量',
      turnover: '成交额',
      dealCount: '成交量',
      projectNews: {
        title: '项目动态',
        moreNews: '更多动态',
        desc1: 'Soybean 在2021年5月28日创建了开源项目 soybean-admin!',
        desc2: 'Yanbowe 向 soybean-admin 提交了一个bug，多标签栏不会自适应。',
        desc3: 'Soybean 准备为 soybean-admin 的发布做充分的准备工作!',
        desc4: 'Soybean 正在忙于为soybean-admin写项目说明文档！',
        desc5: 'Soybean 刚才把工作台页面随便写了一些，凑合能看了！'
      },
      creativity: '创意'
    },
    function: {
      tab: {
        tabOperate: {
          title: '标签页操作',
          addTab: '添加标签页',
          addTabDesc: '跳转到关于页面',
          closeTab: '关闭标签页',
          closeCurrentTab: '关闭当前标签页',
          closeAboutTab: '关闭"关于"标签页',
          addMultiTab: '添加多标签页',
          addMultiTabDesc1: '跳转到多标签页页面',
          addMultiTabDesc2: '跳转到多标签页页面(带有查询参数)'
        },
        tabTitle: {
          title: '标签页标题',
          changeTitle: '修改标题',
          change: '修改',
          resetTitle: '重置标题',
          reset: '重置'
        }
      },
      multiTab: {
        routeParam: '路由参数',
        backTab: '返回 function_tab'
      },
      toggleAuth: {
        toggleAccount: '切换账号',
        authHook: '权限钩子函数 `hasAuth`',
        superAdminVisible: '超级管理员可见',
        adminVisible: '管理员可见',
        adminOrUserVisible: '管理员和用户可见'
      },
      request: {
        repeatedErrorOccurOnce: '重复请求错误只出现一次',
        repeatedError: '重复请求错误',
        repeatedErrorMsg1: '自定义请求错误 1',
        repeatedErrorMsg2: '自定义请求错误 2'
      }
    },
    alova: {
      scenes: {
        captchaSend: '发送验证码',
        autoRequest: '自动请求',
        visibilityRequestTips: '浏览器窗口切换自动请求数据',
        pollingRequestTips: '每3秒自动请求一次',
        networkRequestTips: '网络重连后自动请求',
        refreshTime: '更新时间',
        startRequest: '开始请求',
        stopRequest: '停止请求',
        requestCrossComponent: '跨组件触发请求',
        triggerAllRequest: '手动触发所有自动请求'
      }
    },
    proNaive: {
      form: {
        basic: {
          title: '基础示例',
          appName: '应用名称',
          appStatus: '应用状态',
          createTime: '创建时间',
          responseDate: '响应日期',
          specificationInfo: '规格信息',
          specificate: '规格',
          specificationName: '规格名',
          specificationValue: '规格值',
          specificationColorRed: '红',
          specificationColorOrange: '橙',
          addSpecificateItem: '添加规格项',
          fillValue: '填充值',
          reset: '重置',
          submit: '提交',
          add: '新建',
          delete: '删除',
          color: '颜色',
          normal: '正常',
          anomaly: '异常'
        },
        query: {
          title1: '查询表单，默认展开',
          title2: '查询表单，默认折叠，折叠时保留2行',
          appName: '应用名称',
          appStatus: '应用状态',
          createTime: '创建时间',
          responseDate: '响应日期',
          endDate: '结束日期',
          field: '字段'
        },
        step: {
          title: '分步表单',
          step1: {
            title: '表单1',
            field: '表单1字段',
            nextStep: '下一步'
          },
          step2: {
            title: '表单2',
            field: '表单2字段',
            prevStep: '上一步',
            submit: '提交'
          }
        }
      },
      table: {
        remote: {
          filterCondition: '筛选条件',
          name: '名称',
          createTime: '创建时间',
          responseTime: '响应时间',
          title: '远程加载',
          replicableText: '可复制文本',
          tags: 'tags',
          dateFormatting: '日期格式化',
          image: '图片'
        },
        rowEdit: {
          title: '编辑表格',
          reset: '重置',
          submit: '提交',
          edit: '编辑',
          delete: '删除',
          save: '保存',
          task: '任务',
          score: '评分',
          time: '时间',
          name: '名称',
          action: '操作'
        }
      }
    },
    manage: {
      common: {
        status: {
          enable: '启用',
          disable: '禁用'
        }
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor START] page: 樹補
      // `manage.ipRule` 節（IP 規則管理頁文案）——★兩語鍵集 MUST 相等，型節見 typings/app.d.ts。
      // ★`order` 語彙一律「排序值」、絕不用「优先级」：規則集是 any-match 集合、該欄不參與判定
      // （憲法 §I.7 島 F 之 F1）；文案暗示優先序會讓使用者以為排前面的規則先生效。
      ipRule: {
        title: 'IP 规则列表',
        wbipCidr: '网段',
        wbipType: '规则类型',
        wbipMemo: '备注',
        order: '排序值',
        status: '状态',
        createdAt: '创建时间',
        updatedAt: '更新时间',
        createdBy: '创建者',
        updatedBy: '更新者',
        statusActive: '现役',
        statusDeleted: '已删除',
        statusAll: '全部',
        addIpRule: '新增 IP 规则',
        editIpRule: '编辑 IP 规则',
        restore: '恢复',
        confirmRestore: '确定恢复此规则？',
        restoreSuccess: '恢复成功',
        ruleTypeMap: {
          allow: '放行',
          deny: '阻挡'
        },
        form: {
          wbipCidr: '请输入网段片段（模糊匹配）',
          wbipType: '请选择规则类型',
          status: '请选择状态',
          cidr: '请输入网段，IPv4 或 IPv6（如 192.168.1.0/24）',
          type: '请选择规则类型',
          memo: '请输入备注（选填）',
          order: '请输入排序值（选填）'
        },
        empty: '—'
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(i)+ 004-ip-trust-anchor END]
      role: {
        title: '角色列表',
        roleName: '角色名称',
        roleCode: '角色编码',
        roleStatus: '角色状态',
        roleDesc: '角色描述',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] page: 樹補
        // `manage.role.roleMemo` 欄標籤鍵（FR-043 memo 欄；★兩語鍵集 MUST 相等，型節見 typings/app.d.ts）
        roleMemo: '角色备注',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        menuAuth: '菜单权限',
        buttonAuth: '按钮权限',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] page: 樹補
        // `manage.role.endpointAuth` 鍵（端點維授權 modal 觸發鈕／標題；contracts/msg-keys.md 逐字；
        // ★兩語鍵集 MUST 相等，型節見 typings/app.d.ts）
        endpointAuth: '端点权限',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
        form: {
          roleName: '请输入角色名称',
          roleCode: '请输入角色编码',
          roleStatus: '请选择角色状态',
          roleDesc: '请输入角色描述',
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] memo placeholder
          // （★逐字註明僅管理員可見＝FR-043）
          roleMemo: '请输入角色备注（仅管理员可见）'
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        },
        addRole: '新增角色',
        editRole: '编辑角色'
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance START] page: 樹補
      // `manage.policyArchive` 節（授權回收桶頁文案、15 葉鍵；contracts/msg-keys.md 逐字）——
      // ★兩語鍵集 MUST 相等，型節見 typings/app.d.ts。`archiveReason` 欄顯示原字面、本節不設映譯鍵。
      policyArchive: {
        title: '授权回收站',
        sourceRole: '来源角色',
        dimension: '授权维度',
        target: '授权标的',
        archiveReason: '归档原因',
        archivedAt: '归档时间',
        archivedBy: '归档者',
        restore: '复原',
        confirmRestore: '确定复原此授权？',
        restoreSuccess: '复原成功',
        form: {
          sourceRole: '请输入来源角色编码',
          dimension: '请选择授权维度'
        },
        dimensionLabel: {
          menu: '菜单',
          button: '按钮',
          endpoint: '端点'
        }
      },
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance END]
      user: {
        title: '用户列表',
        userName: '用户名',
        userGender: '性别',
        nickName: '昵称',
        userPhone: '手机号',
        userEmail: '邮箱',
        userStatus: '用户状态',
        userRole: '用户角色',
        form: {
          userName: '请输入用户名',
          userGender: '请选择性别',
          nickName: '请输入昵称',
          userPhone: '请输入手机号',
          userEmail: '请输入邮箱',
          userStatus: '请选择用户状态',
          userRole: '请选择用户角色'
        },
        addUser: '新增用户',
        editUser: '编辑用户',
        gender: {
          male: '男',
          female: '女'
        }
      },
      menu: {
        home: '首页',
        title: '菜单列表',
        id: 'ID',
        parentId: '父级菜单ID',
        menuType: '菜单类型',
        menuName: '菜单名称',
        routeName: '路由名称',
        routePath: '路由路径',
        pathParam: '路径参数',
        layout: '布局',
        page: '页面组件',
        i18nKey: '国际化key',
        icon: '图标',
        localIcon: '本地图标',
        iconTypeTitle: '图标类型',
        order: '排序',
        constant: '常量路由',
        keepAlive: '缓存路由',
        href: '外链',
        hideInMenu: '隐藏菜单',
        activeMenu: '高亮的菜单',
        multiTab: '支持多页签',
        fixedIndexInTab: '固定在页签中的序号',
        query: '路由参数',
        button: '按钮',
        buttonCode: '按钮编码',
        buttonDesc: '按钮描述',
        menuStatus: '菜单状态',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] page: 樹補
        // `manage.menu.menuMemo` 欄標籤鍵（FR-043 memo 欄）＋回收桶 toggle 四鍵（U12——
        // showDeleted/confirmRestore＝msg-keys 前端補鍵段既列、restore/restoreSuccess＝
        // 復原鈕標籤與成功 toast 頁自有鍵；★兩語鍵集 MUST 相等，型節見 typings/app.d.ts）
        menuMemo: '菜单备注',
        showDeleted: '显示已删除',
        restore: '恢复',
        confirmRestore: '确定恢复此菜单？',
        restoreSuccess: '恢复成功',
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        form: {
          home: '请选择首页',
          menuType: '请选择菜单类型',
          menuName: '请输入菜单名称',
          routeName: '请输入路由名称',
          routePath: '请输入路由路径',
          pathParam: '请输入路径参数',
          page: '请选择页面组件',
          layout: '请选择布局组件',
          i18nKey: '请输入国际化key',
          icon: '请输入图标',
          localIcon: '请选择本地图标',
          order: '请输入排序',
          keepAlive: '请选择是否缓存路由',
          href: '请输入外链',
          hideInMenu: '请选择是否隐藏菜单',
          activeMenu: '请选择高亮的菜单的路由名称',
          multiTab: '请选择是否支持多标签',
          fixedInTab: '请选择是否固定在页签中',
          fixedIndexInTab: '请输入固定在页签中的序号',
          queryKey: '请输入路由参数Key',
          queryValue: '请输入路由参数Value',
          button: '请选择是否按钮',
          buttonCode: '请输入按钮编码',
          buttonDesc: '请输入按钮描述',
          menuStatus: '请选择菜单状态',
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] memo placeholder
          // （★逐字註明僅管理員可見＝FR-043）＋父選擇器「頂層」合成選項標籤（parentId=0 提交入口）
          menuMemo: '请输入菜单备注（仅管理员可见）',
          parentRoot: '顶层（无父级）'
          // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
        },
        addMenu: '新增菜单',
        editMenu: '编辑菜单',
        addChildMenu: '新增子菜单',
        type: {
          directory: '目录',
          menu: '菜单'
        },
        iconType: {
          iconify: 'iconify图标',
          local: '本地图标'
        }
      }
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，包含字母、数字、下划线'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有',
    pin: '固定标签',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 条',
    fixed: {
      left: '左固定',
      right: '右固定',
      unFixed: '取消固定'
    }
  }
};

export default local;
