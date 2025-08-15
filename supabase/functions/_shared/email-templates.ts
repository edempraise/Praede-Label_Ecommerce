export const getAttemptedUserDeletionEmailForAdmin = (
  adminEmail: string,
  userIdToDelete: string,
  adminId: string
) => {
  return {
    to: adminEmail,
    from: "Praéde <noreply@example.com>",
    subject: `[Security Alert] Attempted User Deletion`,
    html: `
      <h1>Attempted User Deletion</h1>
      <p>An admin has attempted to delete a user. As per security policy, user deletion is disabled.</p>
      <p><strong>Admin ID:</strong> ${adminId}</p>
      <p><strong>User ID to Delete:</strong> ${userIdToDelete}</p>
    `,
  };
};
