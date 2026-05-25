/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /**
       * record id.
       *
       * Post-039 (rust-entity-id-numeric-migration): rust-api wire 序列化為
       * i64 from `display_id` (Snowflake 41/5/7=53bit, by-design fills
       * `Number.MAX_SAFE_INTEGER` = 2^53-1). No precision loss in JS Number
       * representation. Applies to sys_user / sys_role / sys_endpoint /
       * sys_organization / sys_access_key 5 entities.
       *
       * Note: this is the wire-friendly numeric id, NOT the rust internal
       * ULID identity (see `Auth.UserInfo.userId` for the ULID variant).
       */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;
  }
}
