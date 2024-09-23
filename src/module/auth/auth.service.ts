/** @format */

import { User } from "../../model/user.model";
import { EntityManager } from "@mikro-orm/mysql";
import { UserAttributes } from "../../model/user.model";
import { hash } from "../../common/Crypto";
import { Group } from "../../model/group.model";
import { groupNames } from "../../common/utils/groupPermissionDefault";

export class UserService {
   constructor(public em: EntityManager) {}

   async findUserByEmail(email: string) {
      return await this.em.findOne(
         User,
         { email },
         { populate: ["group.permissions.name"] }
      );
   }

   async createUser(attributes: UserAttributes) {
      const user = new User();
      Object.assign(user, attributes);
      user.password = await hash(attributes.password || "");

      const userCheck = await this.em.findOne(User, {
         username: user.username,
         email: user.email,
      });

      if (userCheck != null) {
         return null;
      }

      const group = await this.em.findOne(Group, { name: groupNames.free });

      if (group == null) {
         return null;
      }

      user.group = group;

      try {
         await this.em.persistAndFlush(user);
         return user;
      } catch (err) {
         return null;
      }
   }

   async deleteUser(id: number) {
      const result = await this.em.nativeDelete(User, { id });
      return !!result;
   }

   async updateUser(id: number, updateData: UserAttributes) {
      const user = await this.em.findOne(User, { id });
      if (!user) return null;

      Object.assign(user, updateData);
      await this.em.persistAndFlush(user);
      return user;
   }
}
