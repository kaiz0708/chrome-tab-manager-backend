/** @format */

import { Entity, ManyToMany, Property } from "@mikro-orm/core";
import { DefaultModel } from "../common/DefaultSQL";
import { Group } from "./group.model";

type TGroup = Group;

@Entity()
export class Permission extends DefaultModel {
   @ManyToMany(() => Group)
   group!: TGroup | null;

   @Property()
   name!: string;
}
