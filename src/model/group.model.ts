/** @format */
import {
   Collection,
   Entity,
   ManyToMany,
   ManyToOne,
   OneToMany,
   Property,
} from "@mikro-orm/core";
import { DefaultModel } from "../common/DefaultSQL";
import { Permission } from "./permission.model";
import { User } from "./user.model";

type TUser = User;

@Entity()
export class Group extends DefaultModel {
   @Property()
   name!: string;

   @ManyToMany({
      entity: () => Permission,
      mappedBy: "group",
   })
   permissions = new Collection<Permission>(this);
}
