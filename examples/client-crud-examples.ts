/* eslint-disable */
// @ts-nocheck
// Example usage of ClientService CRUD operations
import { ClientService } from "../lib/client-service";
import {
  ClientCreateInput,
  ClientUpdateInput,
  ClientQueryInput,
  ClientFilters,
} from "../dto/client.dto";
import {
  validateClientCreate,
  validateClientUpdate,
} from "../schema/ga/clients";

// Example: Create a new client
export async function createClientExample() {
  const clientData: ClientCreateInput = {
    name: "ABC Manufacturing Corp",
    address: "123 Industrial Drive, Manufacturing City, MC 12345",
    contactEmail: "contact@abcmanufacturing.com",
    contactNumber: "+1-555-0123",
    userId: "user-uuid-here",
    teamId: "team-uuid-here",
    createdBy: "admin-user-uuid",
  };

  const result = await ClientService.createClient(clientData);

  if (result.success) {
    console.log("Client created:", result.data);
    return result.data;
  } else {
    console.error("Failed to create client:", result.message);
    if (result.error) console.error("Error details:", result.error);
    return null;
  }
}

// Example: Get client by ID
export async function getClientExample() {
  const clientId = "client-uuid-here";

  const result = await ClientService.getClientById(clientId);

  if (result.success) {
    console.log("Client found:", result.data);
    console.log("Projects count:", result.data?.projects?.length || 0);
    return result.data;
  } else {
    console.error("Failed to get client:", result.message);
    return null;
  }
}

// Example: Get clients with pagination and filtering
export async function getClientsExample() {
  const query: ClientQueryInput = {
    page: 1,
    limit: 10,
    teamId: "team-uuid-here",
    search: "manufacturing",
  };

  const filters = {
    hasProjects: true,
    dateFrom: new Date("2024-01-01"),
    dateTo: new Date("2024-12-31"),
  };

  const sort = {
    sortBy: "name" as const,
    sortOrder: "asc" as const,
  };

  const result = await ClientService.getClients(query, filters, sort);

  if (result.success) {
    console.log("Clients retrieved:", result.data);
    console.log(`Found ${result.data?.clients.length} clients`);
    console.log(`Total: ${result.data?.pagination.total}`);
    console.log(`Pages: ${result.data?.pagination.totalPages}`);

    // Log each client with stats
    result.data?.clients.forEach((client) => {
      console.log(`- ${client.name}: ${client.projectCount} projects`);
    });

    return result.data;
  } else {
    console.error("Failed to get clients:", result.message);
    return null;
  }
}

// Example: Update client
export async function updateClientExample() {
  const clientId = "client-uuid-here";
  const currentVersion = 1; // You would get this from the current client data

  const updateData: ClientUpdateInput = {
    name: "ABC Manufacturing Corporation",
    address: "456 New Industrial Blvd, Manufacturing City, MC 12345",
    contactEmail: "info@abcmanufacturing.com",
    contactNumber: "+1-555-0124",
    updatedBy: "admin-user-uuid",
  };

  const result = await ClientService.updateClient(
    clientId,
    updateData,
    currentVersion
  );

  if (result.success) {
    console.log("Client updated:", result.data);
    console.log("New version:", result.data?.version);
    return result.data;
  } else {
    console.error("Failed to update client:", result.message);
    if (result.message.includes("version conflict")) {
      console.log(
        "The client was updated by someone else. Please refresh and try again."
      );
    }
    return null;
  }
}

// Example: Delete client (soft delete)
export async function deleteClientExample() {
  const clientId = "client-uuid-here";
  const deletedBy = "admin-user-uuid";

  const result = await ClientService.deleteClient(clientId, deletedBy);

  if (result.success) {
    console.log("Client deleted successfully");
    return true;
  } else {
    console.error("Failed to delete client:", result.message);
    return false;
  }
}

// Example: Restore deleted client
export async function restoreClientExample() {
  const clientId = "client-uuid-here";
  const restoredBy = "admin-user-uuid";

  const result = await ClientService.restoreClient(clientId, restoredBy);

  if (result.success) {
    console.log("Client restored successfully");
    return true;
  } else {
    console.error("Failed to restore client:", result.message);
    return false;
  }
}

// Example: Get clients by team
export async function getTeamClientsExample() {
  const teamId = "team-uuid-here";

  const result = await ClientService.getClientsByTeam(teamId);

  if (result.success) {
    console.log(`Found ${result.data?.clients.length} clients for team`);
    result.data?.clients.forEach((client) => {
      console.log(`- ${client.name} (${client.projectCount} projects)`);
    });
    return result.data;
  } else {
    console.error("Failed to get team clients:", result.message);
    return null;
  }
}

// Example: Get clients by user
export async function getUserClientsExample() {
  const userId = "user-uuid-here";

  const result = await ClientService.getClientsByUser(userId);

  if (result.success) {
    console.log(`Found ${result.data?.clients.length} clients for user`);
    return result.data;
  } else {
    console.error("Failed to get user clients:", result.message);
    return null;
  }
}

// Example: Search clients
export async function searchClientsExample() {
  const searchTerm = "manufacturing";
  const teamId = "team-uuid-here";
  const limit = 5;

  const result = await ClientService.searchClients(searchTerm, teamId, limit);

  if (result.success) {
    console.log(
      `Search for "${searchTerm}" found ${result.data?.clients.length} results:`
    );
    result.data?.clients.forEach((client) => {
      console.log(`- ${client.name} (${client.contactEmail})`);
    });
    return result.data;
  } else {
    console.error("Failed to search clients:", result.message);
    return null;
  }
}

// Example: Get client statistics
export async function getClientStatsExample() {
  const teamId = "team-uuid-here"; // Optional

  const result = await ClientService.getClientStats(teamId);

  if (result.success) {
    const stats = result.data;
    console.log("Client Statistics:");
    console.log(`- Total Clients: ${stats?.totalClients}`);
    console.log(`- Total Projects: ${stats?.totalProjects}`);
    console.log(`- Clients with Projects: ${stats?.clientsWithProjects}`);
    console.log(
      `- Average Projects per Client: ${stats?.averageProjectsPerClient}`
    );
    console.log(`- Recent Clients (30 days): ${stats?.recentClientsCount}`);

    console.log("\nTop Clients by Project Count:");
    stats?.topClientsByProjects.forEach((client, index) => {
      console.log(
        `${index + 1}. ${client.name}: ${client.projectCount} projects`
      );
    });

    return stats;
  } else {
    console.error("Failed to get client stats:", result.message);
    return null;
  }
}

// Example: Complete client workflow (create, update, use)
export async function completeClientWorkflowExample() {
  console.log("=== Complete Client Workflow Example ===");

  // 1. Create a new client
  console.log("\n1. Creating new client...");
  const newClient = await createClientExample();
  if (!newClient) return;

  // 2. Get the created client
  console.log("\n2. Retrieving client...");
  const retrievedClient = await ClientService.getClientById(newClient.id);
  if (!retrievedClient.success) return;

  // 3. Update the client
  console.log("\n3. Updating client...");
  const updateResult = await ClientService.updateClient(
    newClient.id,
    {
      contactEmail: "updated@abcmanufacturing.com",
      updatedBy: "admin-user-uuid",
    },
    retrievedClient.data?.version || 1
  );

  if (updateResult.success) {
    console.log("Client updated successfully");
  }

  // 4. Search for the client
  console.log("\n4. Searching for client...");
  await searchClientsExample();

  // 5. Get statistics
  console.log("\n5. Getting client statistics...");
  await getClientStatsExample();

  console.log("\n=== Workflow completed successfully! ===");
}

// Example: Error handling and validation
export async function errorHandlingExample() {
  console.log("=== Error Handling Examples ===");

  // 1. Validation error
  console.log("\n1. Testing validation error...");
  const invalidData = {
    name: "", // Invalid: empty name
    contactEmail: "invalid-email", // Invalid: bad email format
    contactNumber: "abc123", // Invalid: bad phone format
    createdBy: "not-a-uuid", // Invalid: not a UUID
  };

  const validation = validateClientCreate(invalidData);
  if (!validation.success) {
    console.log("Validation errors:", validation.error.flatten().fieldErrors);
  }

  // 2. Non-existent client
  console.log("\n2. Testing non-existent client...");
  const nonExistentResult = await ClientService.getClientById(
    "non-existent-id"
  );
  console.log("Expected failure:", nonExistentResult.message);

  // 3. Version conflict (optimistic locking)
  console.log("\n3. Testing version conflict...");
  const conflictResult = await ClientService.updateClient(
    "existing-client-id",
    { name: "Updated Name", updatedBy: "user-id" },
    999 // Wrong version number
  );
  console.log("Expected conflict:", conflictResult.message);

  console.log("\n=== Error handling examples completed ===");
}

// Helper function to validate and create client
export async function createValidatedClient(rawData: unknown) {
  // Validate the data first
  const validation = validateClientCreate(rawData);

  if (!validation.success) {
    console.error("Validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }

  // Create the client with validated data
  return await ClientService.createClient(validation.data);
}

// Helper function to validate and update client
export async function updateValidatedClient(
  id: string,
  rawData: unknown,
  version: number
) {
  // Validate the data first
  const validation = validateClientUpdate(rawData);

  if (!validation.success) {
    console.error("Validation failed:", validation.error.flatten().fieldErrors);
    return null;
  }

  // Update the client with validated data
  return await ClientService.updateClient(id, validation.data, version);
}
