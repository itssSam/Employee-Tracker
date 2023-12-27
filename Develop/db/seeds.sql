-- Use the employee database
USE employee_tracker;

-- Inserting sample data into the 'department' table
-- These are sample departments in the company
INSERT INTO department (name) VALUES
('Engineering'),
('Human Ressources'),
('Finance'),
('Sales');

-- Insert sample data into the 'role' table
-- These roles are associated with the departments added above
-- The salary is also defined for each role
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 70000, 1), -- Engineering Department
('Systems Analyst', 60000, 1), -- Engineering Department
('HR Manager', 65000, 2), -- Human Ressources Department
('Accountant', 55000, 3), -- Finance Department
('Sales Representative', 50000, 4); -- Sales Department

-- Inserting sample data into the 'employee' table
-- Each employee is assigned a role and optionally a manager
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL), -- Software Engineer without a manager
('Jane', 'Smith', 2, 1), -- Systems Analyst reporting to John Doe
('Emily', 'Jones', 3, NULL), -- HR Manager without a manager
('Michael', 'Brown', 4, NULL), -- Accountant without a manager
('Sara', 'Davis', 5, 3); -- Sales Representative reporting to Emily