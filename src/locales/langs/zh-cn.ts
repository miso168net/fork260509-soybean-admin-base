const local: App.I18n.Schema = {
  // [rev4-inline I18N-WIRING(ii) 004-system-settings START] backend 命名空間（映射 wire msg → 在地化顯示）
  backend: {
    common: {
      // [rev4-inline I18N-WIRING(ii) 011-user-admin] 明細清單在地化分隔符（passwordPolicy violations join 用；T024）
      listSeparator: '、',
      success: '操作成功'
    },
    // [rev4-inline I18N-WIRING(ii) 005-auth-login] auth 命名空間（登入失敗／token 逾期／session 重登在地化）
    auth: {
      login: {
        failed: '用户名或密码错误',
        locked: '登录失败次数过多，请稍后再试',
        captchaRequired: '请完成验证码后再试'
      },
      token: {
        expired: '登录已过期'
      },
      session: {
        reLogin: '请重新登录',
        kicked: '您的账号已在他处登录'
      }
    },
    biz: {
      systemSettings: {
        notFound: '设置项不存在',
        invalidValue: '设置值无效'
      },
      // [rev4-inline I18N-WIRING(ii) 005-auth-login] biz.auth（stub 端點未開放提示）
      auth: {
        notSupported: '该功能暂未开放'
      },
      // [rev4-inline I18N-WIRING(ii) 009-role-admin] biz.role/policy 治理拒因（distinct key；inUse 攜 {userCount} 插值、protectedRevoke 泛化訊息＋blocked 明細走呼叫端；ADR 0050）
      role: {
        seededProtected: '系统内置角色，不可删除',
        inUse: '该角色挂有 {userCount} 个用户，不可删除',
        cannotDeleteSelfRole: '不能删除当前登录用户所属的角色',
        cannotDisableSelfRole: '不能停用当前登录用户所属的角色',
        superCannotDisable: '超级管理员角色不可停用',
        codeImmutable: '角色编码创建后不可修改',
        codeExists: '角色编码已存在',
        codeInvalid: '角色编码格式不正确（仅允许字母、数字、下划线，最长 64 位）',
        notFound: '角色不存在',
        protectedRevoke: '存在受保护的授权，无法撤销'
      },
      // [rev4-inline I18N-WIRING(ii) 010-menu-admin] biz.menu 治理拒因十鍵（一因一鍵、皆 scalar 無插值；data 明細走呼叫端渲染；R9／ADR 0050）
      menu: {
        protectedMenu: '系统内置菜单，不可删除',
        hasChildren: '菜单下尚有子项，请先处理子项',
        routeNameImmutable: '路由名称创建后不可修改',
        menuTypeImmutable: '菜单类型创建后不可修改',
        routeNameExists: '路由名称已存在',
        routeNameInvalid: '路由名称格式不正确（仅允许字母、数字、下划线、连字符，最长 100 位）',
        parentNotFound: '父级菜单不存在',
        parentDeleted: '父级菜单已删除，请先复原父级',
        cycleDetected: '不可将菜单移至自身或其子孙之下',
        notFound: '菜单不存在'
      },
      // [rev4-inline I18N-WIRING(ii) 011-user-admin] biz.user 拒因 15 鍵（一因一鍵；passwordPolicy 攜 {violations} scalar 插值——陣列在攔截層逐碼經 passwordViolation 子鍵譯後 join；ADR 0050/0054）＋biz.unlock 2 鍵（007 欠帳）
      user: {
        seededProtected: '系统内置账号，不可删除',
        cannotDeleteSelf: '不能删除当前登录用户',
        cannotDisableSelf: '不能停用当前登录用户',
        cannotKickSelf: '不能踢除当前登录用户',
        cannotChangeSelfRoles: '不能变更当前登录用户的角色指派',
        superCannotDisable: '超级管理员账号不可停用',
        superRoleProtected: '不可解除超级管理员账号的超管角色指派',
        userNameExists: '用户名已存在',
        userNameImmutable: '用户名创建后不可修改',
        userNameInvalid: '用户名格式不正确（仅允许字母、数字、下划线、连字符，最长 64 位）',
        // [rev4-inline I18N-WIRING(ii) 014-user-center] 自助改密拒因 3 鍵（皆 scalar 無插值；序照固定驗證序 data-model §4、置 passwordPolicy 前）
        passwordMismatch: '两次输入的新密码不一致',
        oldPasswordMismatch: '旧密码不符',
        passwordSameAsOld: '新密码不得与旧密码相同',
        passwordPolicy: '密码不符合密码策略：{violations}',
        passwordViolation: {
          minLength: '长度未达策略下限',
          maxLength: '长度超过策略上限',
          maxBytes: '字节数超过上限',
          requireDigit: '须包含数字',
          requireLowercase: '须包含小写字母',
          requireUppercase: '须包含大写字母',
          requireSpecial: '须包含特殊符号',
          forbidUsername: '不可与用户名相同'
        },
        roleNotFound: '所选角色不存在或已删除',
        userNotFound: '用户不存在',
        sessionPolicyInvalid: '会话策略值无效（仅允许 inherit、single、multi）'
      },
      unlock: {
        invalidTarget: '解锁目标无效（账号维需账号名称、IP 源维需有效 IP 地址）',
        invalidDimension: '解锁维度无效（仅支持账号维与 IP 源维）'
      },
      // [rev4-inline I18N-WIRING(ii) 012-audit-admin] biz.audit 清理拒因 2 鍵（invalidTable scalar；purgeBelowFloor 攜 {minDays} named-object 插值——translateBackendMsg 原生支援；ADR 0050）
      audit: {
        invalidTable: '清理目标不在允许清单内',
        purgeBelowFloor: '清理保留天数不可低于 {minDays} 天'
      },
      policy: {
        notRestorable: '该归档授权不可复原'
      },
      // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin] biz.ipRule 拒因 5 鍵（皆 scalar 無插值；data-model §6；★invalidRuleType 兼收 wbipType 與 deleted 參數值域拒因、措辭不綁死類型欄）
      ipRule: {
        selfLock: '该写入会封锁您当前的来源地址，操作已拒绝',
        conflict: '相同网段与类型的现役规则已存在',
        invalidCidr: '网段格式不正确（IPv4／IPv6 CIDR）',
        invalidRuleType: '规则类型或参数值无效',
        notFound: 'IP 规则不存在或已删除'
      }
    },
    system: {
      forbidden: '没有权限执行此操作'
    }
  },
  // [rev4-inline I18N-WIRING(ii) 004-system-settings END]
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
    // [rev4-inline MODAL-WIRING(e) 004-system-settings] gen-route 產出 manage_system-settings route → route locale 型閘門要求補鍵
    'manage_system-settings': '系统设置',
    // [rev4-inline MODAL-WIRING(e) 009-role-admin] gen-route 產出 manage_policy-archive route → route locale 型閘門要求補鍵（B-061 三清一）
    'manage_policy-archive': '授权回收站',
    // [rev4-inline I18N-WIRING(ii) 012-audit-admin] gen-route 產出 manage_audit route → route locale 型閘門要求補鍵（B-061 audit 項）
    manage_audit: '审计中心',
    // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin] gen-route 產出 manage_ip-rule route → route locale 型閘門要求補鍵（B-061 ip-rule 項）
    'manage_ip-rule': 'IP 规则',
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
      // [rev4-inline I18N-WIRING(ii) 004-system-settings START] 系統設定頁字串
      systemSettings: {
        passwordPolicyTitle: '密码策略',
        sessionTitle: '会话设置',
        ipLoginTitle: 'IP源登录设置',
        accountLoginTitle: '账号登录设置',
        items: {
          passwordMinLength: '密码最小长度',
          passwordMaxLength: '密码最大长度',
          passwordRequireLowercase: '需含小写字母',
          passwordRequireUppercase: '需含大写字母',
          passwordRequireDigit: '需含数字',
          passwordRequireSpecial: '需含特殊符号',
          passwordForbidUsername: '禁止密码与账号相同',
          singleSessionDefault: 'Session 单一在线（全站）',
          sessionIdleTimeout: 'Session 空闲超时（分钟）',
          ipMaxFails: 'IP源登录失败-计数最大值（次）',
          ipWindowMinutes: 'IP源登录失败-计数窗口（分钟）',
          ipCaptchaAfter: 'IP源登录失败-触发验证码（次）',
          loginThrottleMaxFails: '账号登录失败-计数最大值（次）',
          loginThrottleWindowMinutes: '账号登录失败-计数窗口（分钟）',
          loginThrottleCaptchaAfter: '账号登录失败-触发验证码（次）'
        },
        // B-059 tooltip 三語化：per-key help 說明（IconTooltip 用；未鍵化 fallback item.description）
        help: {
          passwordMinLength: '密码最小长度',
          passwordMaxLength: '密码最大长度',
          passwordRequireLowercase: '需含小写字母',
          passwordRequireUppercase: '需含大写字母',
          passwordRequireDigit: '需含数字',
          passwordRequireSpecial: '需含特殊符号',
          passwordForbidUsername: '禁止密码与账号相同',
          singleSessionDefault: '全站单一-session 默认',
          sessionIdleTimeout: '会话闲置超时（分钟）',
          ipMaxFails: '来源节流：来源桶滑动窗内失败达此数即硬锁',
          ipWindowMinutes: '来源节流：来源维滑动窗长（分钟）',
          ipCaptchaAfter: '来源节流：来源桶滑动窗内失败达此数即进验证码软区',
          loginThrottleMaxFails: '登录节流：滑动窗内失败达此数即锁定',
          loginThrottleWindowMinutes: '登录节流：滑动窗长（分钟）＝锁定的最长存续',
          loginThrottleCaptchaAfter: '登录节流：滑动窗内失败达此数即进验证码软区'
        }
      },
      // [rev4-inline I18N-WIRING(ii) 004-system-settings END]
      common: {
        status: {
          enable: '启用',
          disable: '禁用'
        }
      },
      role: {
        title: '角色列表',
        roleName: '角色名称',
        roleCode: '角色编码',
        roleStatus: '角色状态',
        roleDesc: '角色描述',
        menuAuth: '菜单权限',
        buttonAuth: '按钮权限',
        // [rev4-inline MODAL-WIRING(c) 009-role-admin] endpoint-auth-modal net-new modal 自身 key（(c) 明文授权）
        endpointAuth: '端点权限',
        form: {
          roleName: '请输入角色名称',
          roleCode: '请输入角色编码',
          roleStatus: '请选择角色状态',
          roleDesc: '请输入角色描述'
        },
        addRole: '新增角色',
        editRole: '编辑角色'
      },
      // [rev4-inline MODAL-WIRING(e) 009-role-admin START] 授權回收桶頁字串（憲法 §III.2 (e) 明文授權新頁 i18n；B-061 三清一）
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
      // [rev4-inline MODAL-WIRING(e) 009-role-admin END]
      // [rev4-inline I18N-WIRING(ii) 012-audit-admin START] 稽核中心頁字串（四分頁標題/欄位/清理對話框/語意說明/操作鈕；purge.success 攜 {count} 前端插值）
      audit: {
        title: '审计中心',
        tab: {
          operation: '操作日志',
          access: '访问日志',
          login: '登录尝试',
          session: '会话事件'
        },
        common: {
          createTime: '时间',
          operator: '操作者',
          operatorId: '操作者 ID',
          operatorName: '操作者名称',
          realIp: '来源 IP',
          region: '地域',
          traceId: '追踪 ID',
          timeRange: '时间区间'
        },
        operation: {
          entityTable: '目标数据表',
          operation: '动作',
          entityId: '目标 ID',
          payload: '变更快照',
          viewPayload: '查看',
          emptyPayload: '（无快照）',
          payloadBefore: '变更前',
          payloadAfter: '变更后'
        },
        access: {
          httpMethod: '请求方法',
          httpStatus: '状态码',
          httpPath: '请求路径'
        },
        login: {
          attemptedUserName: '尝试账号',
          success: '结果',
          successOption: {
            true: '成功',
            false: '失败'
          },
          throttleNote: '因登录节流短路而被拒的尝试不会记录于此表；此处仅呈现实际判定成败的登录尝试。'
        },
        session: {
          userId: '用户 ID',
          userName: '用户',
          sid: '会话 ID',
          eventType: '事件类型',
          reason: '原因',
          sourceIp: '来源 IP'
        },
        form: {
          entityTable: '请输入目标数据表',
          operation: '请输入动作（如 UPDATE、KICK）',
          operatorId: '请输入操作者 ID',
          operatorName: '请输入操作者名称',
          httpMethod: '请输入请求方法（如 GET）',
          httpStatus: '请输入状态码',
          httpPath: '请输入请求路径（模糊匹配）',
          attemptedUserName: '请输入账号名称（模糊匹配）',
          success: '请选择结果',
          realIp: '请输入来源 IP（精确匹配）',
          userId: '请输入用户 ID',
          userName: '请输入用户名称',
          eventType: '请输入事件类型（如 kicked、idle）',
          reason: '请输入原因',
          timeRange: '请选择时间区间'
        },
        purge: {
          title: '清理日志',
          entry: '清理',
          beforeDays: '保留天数',
          beforeDaysHint: '将删除早于指定天数的记录；下限为 30 天。',
          warning: '此操作会永久删除早于保留天数的记录且无法恢复；清理动作本身将记入操作日志。',
          confirm: '确定执行清理？此操作无法恢复。',
          success: '清理完成，共删除 {count} 条记录'
        }
      },
      // [rev4-inline I18N-WIRING(ii) 012-audit-admin END]
      // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin START] IP 規則頁清單面字串（T015；欄名／狀態三態／類型標籤／搜尋卡 placeholder／空值降級「—」）
      // ＋寫端面字串（T019；drawer 標題／復原鈕＋確認＋成功 toast／drawer 表單 placeholder）；★order 一律「排序值」語彙、不得暗示優先序＝島 F F1 any-match
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
          cidr: '请输入网段（IPv4／IPv6，如 192.168.1.0/24）',
          type: '请选择规则类型',
          memo: '请输入备注（选填）',
          order: '请输入排序值（选填）'
        },
        empty: '—'
      },
      // [rev4-inline I18N-WIRING(ii) 013-ip-rule-admin END]
      user: {
        title: '用户列表',
        userName: '用户名',
        userGender: '性别',
        nickName: '昵称',
        userPhone: '手机号',
        userEmail: '邮箱',
        userStatus: '用户状态',
        userRole: '用户角色',
        // [rev4-inline I18N-WIRING(ii) 011-user-admin] user 頁維運動作＋回收桶＋drawer 控件＋解鎖 modal 字串（T023；showDeleted／restore／restoreSuccess 複用既有 entity-neutral 鍵不重建）
        password: '密码',
        sessionPolicy: '会话策略',
        sessionPolicyOption: {
          inherit: '跟随全站设置',
          single: '单一在线',
          multi: '允许多处在线'
        },
        kick: '踢除下线',
        confirmKick: '确定踢除该用户的所有会话？',
        kickSuccess: '踢除成功',
        resetPwd: '重置密码',
        resetPwdSuccess: '密码重置成功',
        resetPwdUnlockHint: '若该账号登录锁定中需另行解锁',
        confirmRestore: '确定复原此用户？',
        deletedAt: '删除时间',
        unlock: {
          title: '解锁登录',
          dimension: '锁定维度',
          target: '解锁目标',
          dimensionLabel: {
            user: '账号',
            ip: 'IP 源'
          },
          success: '解锁成功',
          form: {
            dimension: '请选择锁定维度',
            userName: '请输入要解锁的账号名称',
            target: '请输入要解锁的 IP 地址'
          }
        },
        form: {
          // [rev4-inline I18N-WIRING(ii) 011-user-admin] drawer add 密碼欄＋edit 會話策略 placeholder（T023）
          password: '请输入密码',
          sessionPolicy: '请选择会话策略',
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
          menuStatus: '请选择菜单状态'
        },
        addMenu: '新增菜单',
        editMenu: '编辑菜单',
        addChildMenu: '新增子菜单',
        // [rev4-inline (d) 010-menu-admin] 顯示已刪除 toggle＋復原確認（憲法 §III.2(d) 錨點；restore/restoreSuccess 復用 policyArchive entity-neutral）
        showDeleted: '显示已删除',
        confirmRestore: '确定复原此菜单？',
        type: {
          directory: '目录',
          menu: '菜单'
        },
        iconType: {
          iconify: 'iconify图标',
          local: '本地图标'
        }
      }
    },
    // [rev4-inline (g) 014-user-center START] 個人中心 self-service 頁文案（4 卡＋created/updated＋改密＋D3 成功 toast；zh-CN 底本＝rev3 zh-cn.ts 逐字承襲、砍死鍵 changePwdBtn；v1.12.0 (g) 擴字串射程）
    userCenter: {
      title: '个人中心',
      basicInfoTitle: '基本资料',
      phoneTitle: '手机号',
      emailTitle: '邮箱',
      passwordTitle: '修改密码',
      userName: '账号',
      roles: '角色',
      gender: '性别',
      nickName: '昵称',
      userPhone: '手机号',
      userEmail: '邮箱',
      save: '保存',
      createdAt: '创建时间',
      updatedAt: '修改时间',
      notModified: '未修改',
      oldPassword: '旧密码',
      newPassword: '新密码',
      confirmPassword: '确认新密码',
      // 改密成功專屬 toast（D3 行為增補、rev3 無此鍵；語意固定＝密碼已更新＋其他裝置已登出）
      changePwdSuccessRevoked: '密码已更新，其他设备已退出登录',
      // 表單內即時驗證統一單句（D2 後半兌現、buildPolicyRules 六政策鍵 rules 共用；字面逐字承襲 rev3 tooWeak；user 親決 2026-07-17）
      pwdPolicyNotMet: '新密码不符合密码复杂度政策',
      origin: {
        systemCreated: '系统创建',
        adminCreated: '管理员创建',
        systemUpdated: '系统修改',
        adminUpdated: '管理员修改'
      },
      verify: {
        sendCode: '发送验证码',
        codePlaceholder: '验证码',
        verify: '验证',
        comingSoon: '功能建置中',
        emailCode: '邮箱验证码',
        phoneCode: '手机验证码',
        backfillHint: '回填前方输入框'
      }
    }
    // [rev4-inline (g) 014-user-center END]
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
