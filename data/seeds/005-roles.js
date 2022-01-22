
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('roles').del()
    .then(function () {
      // Inserts seed entries
      return knex('roles').insert([
        { user_id: 1, business_id: 1, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 2, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 3, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 2, business_id: 3, role_type: 'creator', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 4, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 5, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 6, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 7, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 2, business_id: 7, role_type: 'creator', active_role: true, approved_by: 1 },
        { user_id: 1, business_id: 8, role_type: 'admin', active_role: true, approved_by: 1 },
        { user_id: 2, business_id: 9, role_type: 'admin', active_role: true, approved_by: 2 },
        { user_id: 2, business_id: 6, role_type: 'creator', active_role: false },
        { user_id: 2, business_id: 2, role_type: 'creator', active_role: false },
      ]);
    });
};
