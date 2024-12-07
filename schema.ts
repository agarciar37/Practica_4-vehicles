export const schema = `#graphql
    type Vehicle {
        id: ID!
        name: String!
        manufacturer: String!
        year: Int!
        joke: String!
        parts: [Part!]
    }

    type Part {
        id: ID!
        name: String!
        price: Int!
        vehicleId: ID!
    }

    type Query {
        vehicle(id: ID!): Vehicle!
        vehicles: [Vehicle!]!
        parts: [Part!]!
        vehiclesByManufacturer(manufacturer: String!): [Vehicle!]!
        partsByVehicle(vehicleId: ID!): [Part!]!
        vehicleByYearRange(startYear: Int!, endYear: Int!): [Vehicle!]!

    }

    type Mutation {
        addVehicle(name: String!, manufacturer: String!, year: Int!): Vehicle!
        addPart(name: String!, price: Float!, vehicleId: ID!): Part!
        updateVehicle(id: ID!, name: String!, manufacturer: String!, year: Int!): Vehicle!
        deletePart(id: ID!): Part!
    }     
`