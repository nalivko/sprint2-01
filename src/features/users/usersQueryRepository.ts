import { usersCollection } from "../../db/mongodb"
import { setUsersQueryParams, usersQueryParamsType } from "../../helpers/helper"

export const userQueryRepository = {
    async getUsers(params: { [key: string]: string | undefined }) {
        const queryParams = setUsersQueryParams(params)

        const searchFilter = this.getSearchFilter(queryParams.searchLoginTerm, queryParams.searchEmailTerm)

        console.log("searchFilter ", searchFilter);

        const items = await usersCollection
            .find(searchFilter)
            .sort(queryParams.sortBy, queryParams.sortDirection)
            .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
            .limit(queryParams.pageSize)
            .toArray()

        const totalCount = await usersCollection.countDocuments(searchFilter)

        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount,
            items: items.map(item => {
                return {
                    id: item._id.toString(),
                    login: item.login,
                    email: item.email,
                    createdAt: item.createdAt
                }
            })
        }
    },

    getSearchFilter(loginTerm: string | null, emailTerm: string | null) {

        if (loginTerm || emailTerm) {
            return {
                login: loginTerm ? { $regex: loginTerm, $options: 'i' } : { $exists: true },
                email: emailTerm ? { $regex: emailTerm, $options: 'i' } : { $exists: true }
            }
        }

        return {}
    }
}