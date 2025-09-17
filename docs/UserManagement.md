Front Page Creation Instruction: User Management
Page Name

User Management

Layout Overview

Top Toolbar

Filter Funnel Icon → Opens a filter dialog.

Main Content Area

Left Panel (User Grid) → Shows list of users based on applied filter.

Right Panel (User Detail + Permissions) → Shows details and editable fields for the selected user.

1. Filter Dialog

Triggered by clicking the funnel icon.

Fields:

Username (text input)

Email (text input)

Access Right (dropdown: ReadOnly, Write, Admin)

Buttons:

Apply → Applies filter and populates User Grid with matching results.

Cancel → Closes dialog, clears all filter values, and resets corresponding page controls.

2. Left Panel — User Grid

Columns:

Username

Email

Access Right

Features:

Multi-select users (checkbox or multi-row selection).

Add New User button → Opens modal to add new user (username, email, access right).

Grid updates dynamically when filters are applied.

3. Right Panel — User Details

Appears when a row in the User Grid is selected.

Fields (Read-only for non-Admin, Editable for Admins):

Username

Email

Status (Active / Locked) → Editable by Admin

Last Active Date

Role (dropdown: ReadOnly, Write, Admin) → Editable by Admin

4. Page Access Matrix (Below Right Panel)

A grid/list showing all application pages.

For the selected user:

Admin can assign page-level access rights:

ReadOnly

Write

Multiple Admin users can exist (not limited to one).

5. Behavior Rules

Cancel filter → Clears values and resets User Grid and Right Panel.

Apply filter → Loads users matching filter into the left User Grid.

User selection in grid → Loads details into the right panel.

Admin actions → Can modify status, role, and per-page access rights.

Non-Admin actions → Read-only view only.