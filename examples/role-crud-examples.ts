import { RoleService } from "@/lib/role-service";

// Example usage of Role CRUD operations

async function roleExamples() {
  const userId = "user-123"; // This would come from authentication context

  // 1. Create a new role
  console.log("Creating a new role...");
  const createResult = await RoleService.createRole({
    name: "Administrator",
    createdBy: userId,
  });
  console.log("Create result:", createResult);

  // 2. Fetch all roles
  console.log("\nFetching all roles...");
  const allRoles = await RoleService.fetchAll();
  console.log("All roles:", allRoles);

  // 3. Fetch all roles with search
  console.log("\nFetching roles with search...");
  const searchRoles = await RoleService.fetchAll({ search: "admin" });
  console.log("Search results:", searchRoles);

  // 4. Fetch role by ID
  if (allRoles.success && allRoles.data && allRoles.data.length > 0) {
    const roleId = allRoles.data[0].id;
    console.log(`\nFetching role by ID: ${roleId}`);
    const roleById = await RoleService.fetchById(roleId);
    console.log("Role by ID:", roleById);

    // 5. Update the role
    if (roleById.success && roleById.data) {
      console.log("\nUpdating role...");
      const updateResult = await RoleService.updateRole(
        roleId,
        {
          name: "Super Administrator",
          updatedBy: userId,
        },
        roleById.data.version
      );
      console.log("Update result:", updateResult);
    }

    // 6. Delete the role
    console.log("\nDeleting role...");
    const deleteResult = await RoleService.deleteRole(roleId, userId);
    console.log("Delete result:", deleteResult);

    // 7. Restore the role (optional)
    console.log("\nRestoring role...");
    const restoreResult = await RoleService.restoreRole(roleId, userId);
    console.log("Restore result:", restoreResult);
  }
}

// Error handling example
async function handleRoleOperations() {
  try {
    // Try to create a role with duplicate name
    const result1 = await RoleService.createRole({
      name: "Admin",
      createdBy: "user-123",
    });

    const result2 = await RoleService.createRole({
      name: "Admin", // Same name - should fail
      createdBy: "user-123",
    });

    console.log("First creation:", result1);
    console.log("Second creation (duplicate):", result2);
  } catch (error) {
    console.error("Error in role operations:", error);
  }
}

// Version conflict handling
async function handleVersionConflict() {
  const userId = "user-123";

  // Get a role
  const roles = await RoleService.fetchAll();
  if (roles.success && roles.data && roles.data.length > 0) {
    const role = roles.data[0];

    // Try to update with wrong version (should fail)
    const updateResult = await RoleService.updateRole(
      role.id,
      {
        name: "Updated Role",
        updatedBy: userId,
      },
      999 // Wrong version number
    );

    console.log("Update with wrong version:", updateResult);
  }
}

export { roleExamples, handleRoleOperations, handleVersionConflict };
