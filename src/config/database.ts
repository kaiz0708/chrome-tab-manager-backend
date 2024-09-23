/** @format */
import { MikroORM } from "@mikro-orm/mysql";
import { User } from "../model/user.model";
import { Collections } from "../model/collections.model";
import { Permission } from "../model/permission.model";
import { Group } from "../model/group.model";
import { Tab } from "../model/tab.model";
import {
   groupNames,
   permissionNames,
} from "../common/utils/groupPermissionDefault";

export const orm = await MikroORM.init({
   entities: [User, Collections, Tab, Permission, Group],
   dbName: process.env.MYSQL_DB,
   user: process.env.MYSQL_USERNAME,
   password: process.env.MYSQL_PASSWORD,
   host: process.env.MYSQL_HOST,
   port: parseInt(process.env.MYSQL_PORT || "5432"),

   schemaGenerator: {
      disableForeignKeys: true,
      createForeignKeyConstraints: true,
      ignoreSchema: [],
   },
});

async function initDefault() {
   const em = orm.em.fork();
   // const god = new User()

   let god = await em.findOne(User, { username: "god" });
   let group = await em.findOne(Group, { name: "FREE" });

   if (!god) {
      god = new User();
      god.id = 1;
   }

   if (!group) {
      group = new Group();
      group.name = groupNames.free;
      await em.persistAndFlush(group);
      let groupCheck = await em.findOne(Group, { name: "FREE" });

      if (groupCheck != null) {
         for (const permit of permissionNames) {
            let permission = await em.findOne(Permission, { name: permit });

            if (!permission) {
               permission = new Permission();
               permission.name = permit;
               groupCheck.permissions.add(permission);
               await em.persistAndFlush(permission);
            }
         }
         await em.persist(groupCheck).flush();
         god.group = groupCheck;
      }
   }
   god.username = "god";
   god.email = "nguyenkyanh.tanmai@gmail.com";
   god.displayName = "God";
   god.password = "12345";

   await em.persist(god).flush();
   return god;
}

export async function initDB() {
   const generator = orm.getSchemaGenerator();
   await generator.updateSchema();

   await initDefault();
}
