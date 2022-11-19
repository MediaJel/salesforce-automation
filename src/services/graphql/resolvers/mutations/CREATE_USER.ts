import { graphql } from "@/services/graphql/generated";

const CREATE_USER = graphql(`
  mutation createDashboardUser(
    $username: String!
    $email: String!
    $phone: String!
    $loggedInOrg: ID!
    $roleItems: [RoleItemCreateWithoutRoleInput!]
    $avatar: ID
    $name: String
    $config: UserConfigCreateInput!
  ) {
    createDashboardUser(
      data: {
        username: $username
        email: $email
        phone: $phone
        orgId: $loggedInOrg
        roleItems: $roleItems
        avatar: $avatar
        name: $name
        config: $config
      }
    ) {
      id
      name
      username
      email
      phone
      cognitoUserId
      roles(first: 5) {
        id
        roleItems(first: 20) {
          id
          feature
          actions
        }
        org {
          id
          name
          parentOrg {
            id
            name
          }
          logo {
            id
            key
          }
        }
      }
      avatar {
        id
        key
      }
    }
  }
`);

export default CREATE_USER;
