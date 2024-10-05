/** @format */
import { Entity, Property, Collection, OneToMany, ManyToOne } from "@mikro-orm/core";
import { DefaultModel } from "../common/DefaultSQL";
import { Collections } from "./collections.model";
import { Group } from "./group.model";
type TGroup = Group;

export interface UserAttributes {
   id?: number;
   username?: string;
   email?: string;
   password?: string;
   imageURL?: string;
}

@Entity()
export class User extends DefaultModel {
   @Property({ unique: true })
   username!: string;

   @Property({ unique: true })
   email!: string;

   @Property()
   password!: string;

   @Property({ nullable: true })
   phoneNumber?: string;

   @Property({ nullable: true, length: 512 })
   imageURL?: string;

   @OneToMany({
      entity: () => Collections,
      mappedBy: "user",
      orphanRemoval: true,
   })
   collection = new Collection<Collections>(this);

   @ManyToOne(() => Group)
   group!: TGroup;
}
