/** @format */
import { Entity, Property, ManyToOne } from "@mikro-orm/core";
import { DefaultModel } from "../common/DefaultSQL";
import { Collections } from "./collections.model";
type TCollections = Collections;

@Entity()
export class Tab extends DefaultModel {
   @Property({ nullable: true })
   title!: string;

   @Property({ nullable: true })
   description!: string;

   @Property({ nullable: true })
   url!: string;

   @Property({ nullable: true, length: 512 })
   imageURL?: string;

   @ManyToOne(() => Collections)
   collection!: TCollections;
}