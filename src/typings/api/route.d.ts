declare namespace Api {
  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      /**
       * menu id (rust-api `sys_menu.id`, i32).
       * Serialized as JSON number; mismatch in pre-048 was `id: string`.
       */
      id: number;
      /**
       * parent menu id (rust-api `sys_menu.pid`, String column).
       * Serialized as JSON string under camelCase rule (`pid` stays lowercase).
       * Mismatch in pre-048: field was not declared on TS side at all.
       */
      pid: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }
}
