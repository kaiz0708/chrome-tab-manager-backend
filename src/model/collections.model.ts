/** @format */

import {
   Entity,
   Property,
   ManyToOne,
   OneToMany,
   Collection,
} from "@mikro-orm/core";
import { DefaultModel } from "../common/DefaultSQL";
import { User } from "./user.model";
import { Tab } from "./tab.model";
type TUser = User;

@Entity()
export class Collections extends DefaultModel {
   @Property({ nullable: true })
   title!: string;

   @Property({ nullable: true })
   note!: string;

   @ManyToOne(() => User)
   user!: TUser;

   @OneToMany({
      entity: () => Tab,
      mappedBy: "collection",
      orphanRemoval: true,
   })
   tabs = new Collection<Tab>(this);
}
