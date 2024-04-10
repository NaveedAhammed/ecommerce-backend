import { ObjectId } from "mongodb";
import ChildCategory from "../models/childCategory.model.js";
import Product, { IProduct } from "../models/product.model.js";

class Features {
	searchQuery: string;
	parentCategoryId: string;
	childCategoryId: string;
	brands: string[];
	discount: number;

	constructor(
		search: string,
		parentCategoryId: string,
		childCategoryId: string,
		brands: string[],
		discount: number
	) {
		this.searchQuery = search;
		this.parentCategoryId = parentCategoryId;
		this.childCategoryId = childCategoryId;
		this.brands = brands;
		this.discount = discount;
	}

	public async filter(skip: number, limit: number, page: number) {
		let childCategoriesIds: ObjectId[] = [];
		let products: IProduct[] = [];
		if (this.parentCategoryId) {
			const childCategories = await ChildCategory.find({
				parentCategory: new ObjectId(this.parentCategoryId),
			});
			childCategoriesIds = childCategories.map((it) => it._id);
		}
		let query = {};
		if (this.searchQuery) {
			query["title"] = {
				$regex: this.searchQuery,
				$options: "i",
			};
		}
		if (this.childCategoryId) {
			query["category"] = new ObjectId(this.childCategoryId);
		}
		if (this.discount > 0) {
			query["discount"] = { $gte: this.discount };
		}
		if (childCategoriesIds.length === 0) {
			products = await Product.find({ ...query })
				.populate({
					path: "category",
					populate: {
						path: "parentCategory",
					},
				})
				.populate("color")
				.populate("unit")
				.limit(limit)
				.skip(skip);
		} else {
			products = await Product.find({
				category: { $in: childCategoriesIds },
				...query,
			})
				.populate({
					path: "category",
					populate: {
						path: "parentCategory",
					},
				})
				.populate("color")
				.populate("unit")
				.limit(limit)
				.skip(skip);
		}
		const brands = products.map((it) => it.brand);
		const uniqueBrands = brands.filter((it, index) => {
			return brands.indexOf(it) === index;
		});
		if (this.brands === null) {
			return { products, brands: uniqueBrands };
		} else {
			return {
				products: products.filter((it) =>
					this.brands.includes(it.brand)
				),
				brands: uniqueBrands,
			};
		}
	}
}

export default Features;
