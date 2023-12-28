const inquirer = require('inquirer');
const mysql = require('mysql2');

// Establish a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mysa1234!',
    database: 'employee_tracker'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the employee tracker database.')
    runEmployeeTracker();
});

// Run the application
function runEmployeeTracker() {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'View employees by department',
                'View employees by manager',
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'View total utilized budget of a department',
                'Exit'
            ]
        })
        .then((answer) => {
            switch (answer.action) {
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;

                case 'Add a role':
                    addRole();
                    break;

                case 'Add an employee':
                    addEmployee();
                    break;

                case 'Update an employee role':
                    updateEmployeeRole();
                    break;

                case 'View employees by department':
                    viewEmployeesByDepartment();
                    break;

                case 'View employees by manager':
                    viewEmployeesByManager();
                    break;

                case 'Delete a department':
                    deleteDepartment();
                    break;

                case 'Delete a role':
                    deleteRole();
                    break;

                case 'Delete an employee':
                    deleteEmployee();
                    break;

                case 'View total utilized budget of a department':
                    viewTotalUtilizedBudget();
                    break;

                case 'Exit':
                    db.end();
                    break;
            }
        });
}

function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        runEmployeeTracker();
    });
}

function viewAllRoles() {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        runEmployeeTracker();
    });
}

function viewAllEmployees() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, 
               role.title, department.name AS department, role.salary, 
               CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        runEmployeeTracker();
    });
}


// Function to add a Department
function addDepartment() {
    inquirer
        .prompt({
            name: 'department',
            type: 'input',
            message: 'What is the name of the department?'
        })
        .then((answer) => {
            db.query('INSERT INTO department SET ?', { name: answer.department }, (err, res) => {
                if (err) throw err;
                console.log('Department added.');
                runEmployeeTracker();
            });
        });
}

// Function to add role
function addRole() {
    // First, retrieve a list of departments
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: 'title',
                    type: 'input',
                    message: 'What is the name of the role?'
                },

                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of the role?'
                },

                {
                    name: 'department_id',
                    type: 'list',
                    message: 'Which department does the role belong to?',
                    choices: departments.map((department) => ({
                        name: department.name,
                        value: department.id
                    }))
                }
            ])
            .then((answer) => {
                db.query('INSERT INTO role SET ?', {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: answer.department_id
                }, (err, res) => {
                    if (err) throw err;
                    console.log('Role added.');
                    runEmployeeTracker();
                });
            });
    });
}

// Function to add employee
function addEmployee() {
    // First, retrieve lists of roles and employees for manager selection
    db.promise().query('SELECT id, title FROM role')
        .then(([roles]) => {
            return Promise.all([
                roles,
                db.promise().query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee")
            ]);
        })
        .then(([roles, employees]) => {
            return inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'What is the employee\'s first name?'
                },

                {
                    name: 'lastName',
                    type: 'input',
                    message: 'What is the employee\'s last name?'
                },

                {
                    name: 'roleId',
                    type: 'list',
                    message: 'What is the employee\'s role',
                    choices: roles.map(role => ({ name: role.title, value: role.id }))
                },

                {
                    name: 'ManagerId',
                    type: 'list',
                    message: 'Who is the employee\'s manager?',
                    choices: employees[0].map(employee => ({ name: employee.name, value: employee.id })).concat([{ name: 'None', value: null }])
                }
            ]);
        })
        .then(answer => {
            const newEmployee = {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: answer.roleId,
                manager_id: answer.managerId
            };
            return db.promise().query('INSERT INTO employee SET ?', newEmployee);
        })
        .then(() => {
            console.log('Employee added.');
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

function updateEmployeeRole() {
    let employeesList;
    let rolesList;

    db.promise().query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee")
        .then(([employees]) => {
            employeesLsit = employees;
            return db.promise().query("SELECT id, title FROM role");
        })
        .then(([roles]) => {
            rolesList = roles;
            return inquirer.prompt([
                {
                    name: 'employeeId',
                    type: 'list',
                    message: 'Which employee\'s role do you want to to update?',
                    choices: employeesList.map(emp => ({ name: emp.name, value: emp.id }))
                },

                {
                    name: 'roleId',
                    type: 'list',
                    message: 'Which is the new role?',
                    choices: rolesList.map(role => ({ name: role.title, value: role.id }))
                }
            ]);
        })
        .then(answer => {
            return db.promise().query("UPDATE employee SET role_id = ? WHERE id = ?", [answer.roleId, answer.employeeId]);
        })
        .then(() => {
            console.log('Employee role updated.');
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

function viewEmployeesByDepartment() {
    db.query("SELECT employee.first_name, employee.last_name, department.name AS department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id", (err, res) => {
        if (err) throw err;
        console.table(res);
        runEmployeeTracker();
    });
}

function viewEmployeesByManager() {
    db.promise().query("SELECT id, CONCAT(first_name,' ', last_name) AS manager FROM employee WHERE manager_id IS NULL")
        .then(([managers]) => {
            return inquirer.prompt({
                name: 'managerId',
                type: 'list',
                message: 'Select a manager to view their employees:',
                choices: managers.map(mgr => ({ name: mgr.manager, value: mgr.id }))
            });
        })
        .then(answer => {
            return db.promise().query("SELECT first_name, last_name FROM employee WHERE manager_id = ?", [answer.managerId]);
        })
        .then(([employees]) => {
            console.table(employees);
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

function deleteDepartment() {
    db.promise().query("SELECT id, name FROM department")
        .then(([departments]) => {
            return inquirer.prompt({
                name: 'departmentId',
                type: 'list',
                message: 'Select the department to delete:',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            })
        })
        .then(answer => {
            return db.promise().query("DELETE FROM department WHERE id = ?", [answer.departmentId]);
        })
        .then(() => {
            console.log('Department deleted.');
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

function deleteRole() {
    db.promise().query("SELECT id, title FROM role")
        .then(([roles]) => {
            return inquirer.prompt({
                name: 'roleId',
                type: 'list',
                message: 'Select the role to delete:',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            });
        })
        .then(() => {
            return db.promise().query("DELETE FROM role WHERE id = ?", [answer.roleId]);
        })
        .then(() => {
            console.log('Role deleted.');
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

function deleteEmployee() {
    db.promise().query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee")
        .then(([employees]) => {
            return inquirer.prompt({
                name: 'employeeId',
                type: 'list',
                message: 'Select the employee to delete:',
                choices: employees.map(emp => ({ name: emp.name, value: emp.id }))
            });
        })
        .then(answer => {
            return db.promise().query("DELETE FROM employee WHERE id = ?", [answer.employeeId]);
        })
        .then(() => {
            console.log('Employee deleted.');
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

function viewTotalUtilizedBudget() {
    db.promise().query("SELECT id, name FROM department")
        .then(([departments]) => {
            return inquirer.prompt({
                name: 'departmentId',
                type: 'list',
                message: 'Select the department to view its total utilized budget:',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            });
        })
        .then(answer => {
            const query = `
                SELECT department.name AS department, SUM(role.salary) AS total_budget
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                WHERE department.id = ?
                GROUP BY department.id
            `;
            return db.promise().query(query, [answer.departmentId]);
        })
        .then(([results]) => {
            if (results.length > 0) {
                console.table(results);
            } else {
                console.log('No employees found in this department.');
            }
            runEmployeeTracker();
        })
        .catch(err => {
            console.error(err);
            runEmployeeTracker();
        });
}

