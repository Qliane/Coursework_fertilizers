/*==============================================================*/
/* Table: BILL                                                  */
/*==============================================================*/
create table BILL (
   BILL_ID              SERIAL               not null,
   UPD_ID               INT4                 not null,
   USER_ID              INT4                 not null,
   EMP_USER_ID          INT4                 not null,
   FLIST_ID             INT4                 not null,
   BILL_CREATED_AT      DATE                 not null,
   constraint PK_BILL primary key (BILL_ID)
);

/*==============================================================*/
/* Index: BILL_PK                                               */
/*==============================================================*/
create unique index BILL_PK on BILL (
BILL_ID
);

/*==============================================================*/
/* Index: Link_FK                                               */
/*==============================================================*/
create  index Link_FK on BILL (
UPD_ID
);

/*==============================================================*/
/* Index: tn_link_driver_FK                                     */
/*==============================================================*/
create  index tn_link_driver_FK on BILL (
USER_ID
);

/*==============================================================*/
/* Index: create_tn_FK                                          */
/*==============================================================*/
create  index create_tn_FK on BILL (
EMP_USER_ID
);

/*==============================================================*/
/* Index: tn_contains_fert_list_FK                              */
/*==============================================================*/
create  index tn_contains_fert_list_FK on BILL (
FLIST_ID
);

/*==============================================================*/
/* Table: Container                                             */
/*==============================================================*/
create table Container (
   CO_ID                SERIAL               not null,
   CO_NAME              CHAR(128)            not null,
   CO_WEIGHT            NUMERIC(6,4)         not null,
   CO_WIDTH             NUMERIC(6,5)         not null,
   CO_HEIGHT            NUMERIC(6,5)         not null,
   constraint PK_CONTAINER primary key (CO_ID)
);

/*==============================================================*/
/* Index: Container_PK                                          */
/*==============================================================*/
create unique index Container_PK on Container (
CO_ID
);

/*==============================================================*/
/* Table: DRIVER                                                */
/*==============================================================*/
create table DRIVER (
   USER_ID              INT4                 not null,
   PARTNER_ID           INT4                 not null,
   DRIVER_LICENSE       CHAR(32)             not null,
   DRIVER_CATEGORIES    NUMERIC              null,
   constraint PK_DRIVER primary key (USER_ID)
);

/*==============================================================*/
/* Index: DRIVER_PK                                             */
/*==============================================================*/
create unique index DRIVER_PK on DRIVER (
USER_ID
);

/*==============================================================*/
/* Index: employ_FK                                             */
/*==============================================================*/
create  index employ_FK on DRIVER (
PARTNER_ID
);

/*==============================================================*/
/* Table: ELECTRONIC_BILL                                       */
/*==============================================================*/
create table ELECTRONIC_BILL (
   ELECTRONIC_BILL_ID   SERIAL               not null,
   BILL_ID              INT4                 not null,
   ELECTRONIC_BILL_STATUS INT4                 not null,
   constraint PK_ELECTRONIC_BILL primary key (ELECTRONIC_BILL_ID)
);

/*==============================================================*/
/* Index: ELECTRONIC_BILL_PK                                    */
/*==============================================================*/
create unique index ELECTRONIC_BILL_PK on ELECTRONIC_BILL (
ELECTRONIC_BILL_ID
);

/*==============================================================*/
/* Index: Äîïîëíÿåò_FK                                          */
/*==============================================================*/
create  index Äîïîëíÿåò_FK on ELECTRONIC_BILL (
BILL_ID
);

/*==============================================================*/
/* Table: EMPLOYER                                              */
/*==============================================================*/
create table EMPLOYER (
   USER_ID              INT4                 not null,
   STOR_ID              INT4                 not null,
   EMP_SNILS            CHAR(64)             not null,
   EMP_INN              CHAR(16)             not null,
   constraint PK_EMPLOYER primary key (USER_ID)
);

/*==============================================================*/
/* Index: EMPLOYER_PK                                           */
/*==============================================================*/
create unique index EMPLOYER_PK on EMPLOYER (
USER_ID
);

/*==============================================================*/
/* Index: works_FK                                              */
/*==============================================================*/
create  index works_FK on EMPLOYER (
STOR_ID
);

/*==============================================================*/
/* Table: FERTILIZER                                            */
/*==============================================================*/
create table FERTILIZER (
   FERTIL_ID            SERIAL               not null,
   CO_ID                INT4                 not null,
   FERTIL_NAME          CHAR(256)            not null,
   FERTIL_WEIGHT        INT4                 not null,
   constraint PK_FERTILIZER primary key (FERTIL_ID)
);

/*==============================================================*/
/* Index: FERTILIZER_PK                                         */
/*==============================================================*/
create unique index FERTILIZER_PK on FERTILIZER (
FERTIL_ID
);

/*==============================================================*/
/* Index: placed_FK                                             */
/*==============================================================*/
create  index placed_FK on FERTILIZER (
CO_ID
);

/*==============================================================*/
/* Index: Fertilizer_name_index                                 */
/*==============================================================*/
create  index Fertilizer_name_index on FERTILIZER (
FERTIL_NAME
);

/*==============================================================*/
/* Table: FLIST                                                 */
/*==============================================================*/
create table FLIST (
   FLIST_ID             SERIAL               not null,
   constraint PK_FLIST primary key (FLIST_ID)
);

/*==============================================================*/
/* Index: FLIST_PK                                              */
/*==============================================================*/
create unique index FLIST_PK on FLIST (
FLIST_ID
);

/*==============================================================*/
/* Table: FLIST_ITEM                                            */
/*==============================================================*/
create table FLIST_ITEM (
   FLIST_ITEM_ID        SERIAL               not null,
   FLIST_ID             INT4                 not null,
   FERTIL_ID            INT4                 not null,
   FLIST_ITEM_FACT_COUNT INT4                 null,
   FLIST_ITEM_DECL_COUNT INT4                 not null,
   constraint PK_FLIST_ITEM primary key (FLIST_ITEM_ID)
);

/*==============================================================*/
/* Index: FLIST_ITEM_PK                                         */
/*==============================================================*/
create unique index FLIST_ITEM_PK on FLIST_ITEM (
FLIST_ITEM_ID
);

/*==============================================================*/
/* Index: contains_FK                                           */
/*==============================================================*/
create  index contains_FK on FLIST_ITEM (
FLIST_ID
);

/*==============================================================*/
/* Index: extends_FK                                            */
/*==============================================================*/
create  index extends_FK on FLIST_ITEM (
FERTIL_ID
);

/*==============================================================*/
/* Table: "ORDER"                                               */
/*==============================================================*/
create table "ORDER" (
   ORDER_ID             SERIAL               not null,
   STOR_ID              INT4                 not null,
   USER_ID              INT4                 not null,
   FLIST_ID             INT4                 not null,
   ORDER_CREATED_AT     DATE                 not null,
   ORDER_REALIZED_AT    DATE                 null,
   constraint PK_ORDER primary key (ORDER_ID)
);

/*==============================================================*/
/* Index: ORDER_PK                                              */
/*==============================================================*/
create unique index ORDER_PK on "ORDER" (
ORDER_ID
);

/*==============================================================*/
/* Index: intend_FK                                             */
/*==============================================================*/
create  index intend_FK on "ORDER" (
STOR_ID
);

/*==============================================================*/
/* Index: create_order_FK                                       */
/*==============================================================*/
create  index create_order_FK on "ORDER" (
USER_ID
);

/*==============================================================*/
/* Index: order_contains_fert_list_FK                           */
/*==============================================================*/
create  index order_contains_fert_list_FK on "ORDER" (
FLIST_ID
);

/*==============================================================*/
/* Table: PARTNER                                               */
/*==============================================================*/
create table PARTNER (
   PARTNER_ID           SERIAL               not null,
   USER_ID              INT4                 not null,
   PARTNER_INN          CHAR(16)             not null,
   PARTNER_FULLNAME     CHAR(256)            not null,
   PARTNER_PHONE        CHAR(16)             null,
   PARTNER_FACT_ADDRESS CHAR(256)            null,
   PARTNER_POST_ADDRESS CHAR(256)            not null,
   constraint PK_PARTNER primary key (PARTNER_ID)
);

/*==============================================================*/
/* Index: PARTNER_PK                                            */
/*==============================================================*/
create unique index PARTNER_PK on PARTNER (
PARTNER_ID
);

/*==============================================================*/
/* Index: Lead_FK                                               */
/*==============================================================*/
create  index Lead_FK on PARTNER (
USER_ID
);

/*==============================================================*/
/* Table: ROLE                                                  */
/*==============================================================*/
create table ROLE (
   ROLE_ID              SERIAL               not null,
   ROLE_NAME            CHAR(32)             not null,
   constraint PK_ROLE primary key (ROLE_ID)
);

/*==============================================================*/
/* Index: ROLE_PK                                               */
/*==============================================================*/
create unique index ROLE_PK on ROLE (
ROLE_ID
);

/*==============================================================*/
/* Table: STORAGE                                               */
/*==============================================================*/
create table STORAGE (
   STOR_ID              SERIAL               not null,
   STOR_ADDRESS         CHAR(512)            not null,
   STOR_CAPACITY        INT4                 null,
   STOR_FULLNAME        CHAR(256)            not null,
   STOR_PHONE           CHAR(32)             null,
   constraint PK_STORAGE primary key (STOR_ID)
);

/*==============================================================*/
/* Index: STORAGE_PK                                            */
/*==============================================================*/
create unique index STORAGE_PK on STORAGE (
STOR_ID
);

/*==============================================================*/
/* Table: UPD                                                   */
/*==============================================================*/
create table UPD (
   UPD_ID               SERIAL               not null,
   USER_ID              INT4                 not null,
   PARTNER_ID           INT4                 not null,
   UPD_CONCL_DATE       DATE                 not null,
   UPD_SHIP_DATE        DATE                 null,
   constraint PK_UPD primary key (UPD_ID)
);

/*==============================================================*/
/* Index: UPD_PK                                                */
/*==============================================================*/
create unique index UPD_PK on UPD (
UPD_ID
);

/*==============================================================*/
/* Index: Create_upd_FK                                         */
/*==============================================================*/
create  index Create_upd_FK on UPD (
USER_ID
);

/*==============================================================*/
/* Index: conclude_FK                                           */
/*==============================================================*/
create  index conclude_FK on UPD (
PARTNER_ID
);

/*==============================================================*/
/* Table: "USER"                                                */
/*==============================================================*/
create table "USER" (
   USER_ID              SERIAL               not null,
   ROLE_ID              INT4                 not null,
   USER_NAME            CHAR(16)             not null,
   USER_SECONDNAME      CHAR(32)             not null,
   USER_PATRONYMIC      CHAR(32)             null,
   USER_PASSWORD        CHAR(64)             not null,
   constraint PK_USER primary key (USER_ID)
);

/*==============================================================*/
/* Index: USER_PK                                               */
/*==============================================================*/
create unique index USER_PK on "USER" (
USER_ID
);

/*==============================================================*/
/* Index: belongs_FK                                            */
/*==============================================================*/
create  index belongs_FK on "USER" (
ROLE_ID
);

/*==============================================================*/
/* Table: VEHICLE                                               */
/*==============================================================*/
create table VEHICLE (
   VEHICLE_ID           SERIAL               not null,
   PARTNER_ID           INT4                 not null,
   VEHICLE_REGISTRATION_MARK CHAR(64)             not null,
   VEHICLE_TYPE         CHAR(1)              not null,
   VEHICLE_CAPACITY     NUMERIC(6,2)         not null,
   constraint PK_VEHICLE primary key (VEHICLE_ID)
);

/*==============================================================*/
/* Index: VEHICLE_PK                                            */
/*==============================================================*/
create unique index VEHICLE_PK on VEHICLE (
VEHICLE_ID
);

/*==============================================================*/
/* Index: own_FK                                                */
/*==============================================================*/
create  index own_FK on VEHICLE (
PARTNER_ID
);

/*==============================================================*/
/* Index: Vehicle_reg_number_index                              */
/*==============================================================*/
create  index Vehicle_reg_number_index on VEHICLE (
VEHICLE_REGISTRATION_MARK
);

/*==============================================================*/
/* Table: tn_link_vehicle                                       */
/*==============================================================*/
create table tn_link_vehicle (
   BILL_ID              INT4                 not null,
   VEHICLE_ID           INT4                 not null,
   constraint PK_TN_LINK_VEHICLE primary key (BILL_ID, VEHICLE_ID)
);

/*==============================================================*/
/* Index: tn_link_vehicle_PK                                    */
/*==============================================================*/
create unique index tn_link_vehicle_PK on tn_link_vehicle (
BILL_ID,
VEHICLE_ID
);

/*==============================================================*/
/* Index: tn_link_vehicle2_FK                                   */
/*==============================================================*/
create  index tn_link_vehicle2_FK on tn_link_vehicle (
VEHICLE_ID
);

/*==============================================================*/
/* Index: tn_link_vehicle_FK                                    */
/*==============================================================*/
create  index tn_link_vehicle_FK on tn_link_vehicle (
BILL_ID
);

alter table BILL
   add constraint FK_BILL_LINK_UPD foreign key (UPD_ID)
      references UPD (UPD_ID)
      on delete restrict on update restrict;

alter table BILL
   add constraint FK_BILL_CREATE_TN_EMPLOYER foreign key (EMP_USER_ID)
      references EMPLOYER (USER_ID)
      on delete restrict on update restrict;

alter table BILL
   add constraint FK_BILL_TN_CONTAI_FLIST foreign key (FLIST_ID)
      references FLIST (FLIST_ID)
      on delete cascade on update cascade;

alter table BILL
   add constraint FK_BILL_TN_LINK_D_DRIVER foreign key (USER_ID)
      references DRIVER (USER_ID)
      on delete restrict on update restrict;

alter table DRIVER
   add constraint FK_DRIVER_EMPLOY_PARTNER foreign key (PARTNER_ID)
      references PARTNER (PARTNER_ID)
      on delete restrict on update restrict;

alter table DRIVER
   add constraint FK_DRIVER_IS_A_DRIV_USER foreign key (USER_ID)
      references "USER" (USER_ID)
      on delete cascade on update cascade;

alter table ELECTRONIC_BILL
   add constraint FK_ELECTRON_ÄÎÏÎËÍßÅÒ_BILL foreign key (BILL_ID)
      references BILL (BILL_ID)
      on delete cascade on update cascade;

alter table EMPLOYER
   add constraint FK_EMPLOYER_IS_A_EMPL_USER foreign key (USER_ID)
      references "USER" (USER_ID)
      on delete cascade on update cascade;

alter table EMPLOYER
   add constraint FK_EMPLOYER_WORKS_STORAGE foreign key (STOR_ID)
      references STORAGE (STOR_ID)
      on delete restrict on update restrict;

alter table FERTILIZER
   add constraint FK_FERTILIZ_PLACED_CONTAINE foreign key (CO_ID)
      references Container (CO_ID)
      on delete restrict on update cascade;

alter table FLIST_ITEM
   add constraint FK_FLIST_IT_CONTAINS_FLIST foreign key (FLIST_ID)
      references FLIST (FLIST_ID)
      on delete cascade on update cascade;

alter table FLIST_ITEM
   add constraint FK_FLIST_IT_EXTENDS_FERTILIZ foreign key (FERTIL_ID)
      references FERTILIZER (FERTIL_ID)
      on delete restrict on update restrict;

alter table "ORDER"
   add constraint FK_ORDER_CREATE_OR_USER foreign key (USER_ID)
      references "USER" (USER_ID)
      on delete restrict on update restrict;

alter table "ORDER"
   add constraint FK_ORDER_INTEND_STORAGE foreign key (STOR_ID)
      references STORAGE (STOR_ID)
      on delete restrict on update restrict;

alter table "ORDER"
   add constraint FK_ORDER_ORDER_CON_FLIST foreign key (FLIST_ID)
      references FLIST (FLIST_ID)
      on delete cascade on update cascade;

alter table PARTNER
   add constraint FK_PARTNER_LEAD_USER foreign key (USER_ID)
      references "USER" (USER_ID)
      on delete restrict on update restrict;

alter table UPD
   add constraint FK_UPD_CREATE_UP_USER foreign key (USER_ID)
      references "USER" (USER_ID)
      on delete restrict on update restrict;

alter table UPD
   add constraint FK_UPD_CONCLUDE_PARTNER foreign key (PARTNER_ID)
      references PARTNER (PARTNER_ID)
      on delete restrict on update restrict;

alter table "USER"
   add constraint FK_USER_BELONGS_ROLE foreign key (ROLE_ID)
      references ROLE (ROLE_ID)
      on delete restrict on update restrict;

alter table VEHICLE
   add constraint FK_VEHICLE_OWN_PARTNER foreign key (PARTNER_ID)
      references PARTNER (PARTNER_ID)
      on delete restrict on update restrict;

alter table tn_link_vehicle
   add constraint FK_TN_LINK__TN_LINK_V_BILL foreign key (BILL_ID)
      references BILL (BILL_ID)
      on delete cascade on update restrict;

alter table tn_link_vehicle
   add constraint FK_TN_LINK__TN_LINK_V_VEHICLE foreign key (VEHICLE_ID)
      references VEHICLE (VEHICLE_ID)
      on delete restrict on update restrict;

