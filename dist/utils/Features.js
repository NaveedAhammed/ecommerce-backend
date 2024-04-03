import { ObjectId } from "mongodb";
class Features {
    constructor(search, parentCategoryId, childCategoryId) {
        this.searchQuery = search;
        this.parentCategoryId = parentCategoryId;
        this.childCategoryId = childCategoryId;
    }
    filter() {
        let query = {};
        if (this.searchQuery) {
            query["title"] = {
                $regex: this.searchQuery,
                $options: "i",
            };
        }
        if (this.childCategoryId && this.parentCategoryId) {
            query["category"] = {
                _id: new ObjectId(this.childCategoryId),
                parentCategory: new ObjectId(this.parentCategoryId),
            };
        }
        else if (this.parentCategoryId && !this.childCategoryId) {
            query["category"] = {
                parentCategory: new ObjectId(this.parentCategoryId),
            };
        }
        return query;
    }
}
export default Features;
