const mysql = require("mysql");
const { prompt } = require("inquirer");
const { printTable } = require("console-table-printer")

// CREATING MY CONNECTION TO SQL DATABASE
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Iandloveandyou123",
    database: "employeesDB"
})


connection.connect(function (err) {
    if (err) throw err;
    startApp();
})

function startApp() {
    prompt({
        name: "action",
        type: "list",
        message: "Welcome to our employee database! What would you like to do?",
        choices: [
            "View all employees",
            "View all departments",
            "View all roles",
            "Add an employee",
            "Add department",
            "Add a role",
            "EXIT"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "View all employees":
                viewEmployees();
                break;
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Add department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "EXIT":
                endApp();
                break;
            default:
                break;
        }
    })
}
//tested 8/21/2020
function viewEmployees() {
    var query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(res.length + " employees found!");
        printTable(res);
        startApp();
    })
}
//tested 8/21/2020
function viewDepartments() {
    var query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        if (err) throw err;
        printTable(res)
        startApp();
    })
}

function viewRoles() {
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        if (err) throw err;
        printTable(res);
        startApp();
    })
}

function addEmployee() {
    connection.query("SELECT * FROM role", function (err, res) {
        //if (err) throw err;

        prompt([
            {
                name: "first_name",
                type: "input",
                message: "Employee's first name: ",
                validate: function (answer) {
                    if (answer !== '') {
                        return true;
                    }
                    return 'Please do not leave this field blank'
                }

            },
            {
                name: "last_name",
                type: "input",
                message: "Employee's last name: ",
                validate: function (answer) {
                    if (answer !== '') {
                        return true;
                    }
                    return 'Please do not leave this field blank'
                }
            },
            {
                name: "role",
                type: "list",
                choices: function () {
                    var roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }
                    return roleArray;
                },
                message: "What is this employee's role? "
            }
        ]).then(function (answer) {
            let roleID;
            for (let j = 0; j < res.length; j++) {
                if (res[j].title == answer.role) {
                    roleID = res[j].id;
                    console.log(roleID)
                }
            }
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: roleID,
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your employee has been added!");
                    viewEmployees();
                    startApp();
                }
            )
        })
        
    })
    
}

function addDepartment() {
    prompt([
        {
            name: "new_dept",
            type: "input",
            message: "What is the new department you would like to add?"
        }
    ]).then(function (answer) {
        connection.query(
            "INSERT INTO department SET ?",
            {
                name: answer.new_dept
            }
        );
        var query = "SELECT * FROM department";
        connection.query(query, function (err, res) {
            if (err) throw err;
            console.table('All Departments:', res);
            startApp();
        })
    })
}

function addRole() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;

        prompt([
            {
                name: "new_role",
                type: "input",
                message: "What is the Title of the new role?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary of this position? (Enter a number?)"
            },
            {
                name: "deptChoice",
                type: "rawlist",
                choices: function () {
                    var deptArry = [];
                    for (let i = 0; i < res.length; i++) {
                        deptArry.push(res[i].name);
                    }
                    return deptArry;
                },
            }
        ]).then(function (answer) {
            let deptID;
            for (let j = 0; j < res.length; j++) {
                if (res[j].name == answer.deptChoice) {
                    deptID = res[j].id;
                }
            }

            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: answer.new_role,
                    salary: answer.salary,
                    department_id: deptID
                },
                function (err, res) {
                    if (err) throw err;
                    console.log("Your new role has been added!");
                    startApp();
                }
            )
        })
    })

}

function endApp() {
    connection.end();
}