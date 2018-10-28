var app = new Vue({
    el: '#root',
    data: {
        errorMessage: "",
        successMessage: "",
        Regdate: "",
        Customer_id: "",
        dataloaded: false,
        tabs: [{
            name: "3 Days Reminder SMS",
            id: 0,
            isActive: true
        },
        {
            name: "1 Day Overdue SMS",
            id: 1,
            isActive: false
        },
        {
            name: "16 Days Overdue SMS/CALL",
            id: 2,
            isActive: false
        },
        {
            name: "31 Days Overdue SMS/VISIT",
            id: 3,
            isActive: false
        }

        ],
        activeTab: {},
        reminder_customers: [],
        overdue1_customers: [],
        overdue2_customers: [],
        overdue3_customers: [],
        comment: {},
        select_call: false,
        checKiD: [],
        phoneNo: '',
        CustName: '',
        dep_startDate: '',
        dep_endDate: '',
        inv_startDate: '',
        inv_endDate: ''

    },

    mounted: function () {
        console.log('mounted');

        this.getReminderSMS();
        this.get1DayOverdue();
        this.get16DaysOverdue();
        this.get31DaysOverdue();
    },

    computed: {

    },
    ready: function () {
        this.setActive(this.tabs[0]);

    },
    methods: {

        setActive: function (tab) {
            var self = this;
            tab.isActive = true;
            this.activeTab = tab;
            /*this.activeTab.isActive = true;*/
            console.log("activeTab name=" + this.activeTab.name);
            this.tabs.forEach(function (tab) {
                console.log("TAB => " + tab);
                console.log("activeTab id => " + self.activeTab.id);
                console.log("tab id=" + tab.id);
                if (self.activeTab.id == 1) {
                    app.select_call = false;
                }

                if (tab.id !== self.activeTab.id) { tab.isActive = false; }
            });
        },

        getReminderSMS: function () {
            axios.get("https://altara-api.herokuapp.com/api.php?action=autoreminder")
                .then(function (response) {
                    console.log(response);
                    if (response.data.error) {
                        app.errorMessage = response.data.message;
                    } else {
                        app.reminder_customers = response.data.users;
                    }
                });
        },
        get1DayOverdue: function () {
            axios.get("https://altara-api.herokuapp.com/api.php?action=overdue1")
                .then(function (response) {
                    /*   console.log(response); */
                    if (response.data.error) {
                        app.errorMessage = response.data.message;
                    } else {
                        app.overdue1_customers = response.data.users;
                    }
                });
        },
        get16DaysOverdue: function () {
            axios.get("https://altara-api.herokuapp.com/api.php?action=overdue2")
                .then(function (response) {
                    /*   console.log(response); */
                    if (response.data.error) {
                        app.errorMessage = response.data.message;
                    } else {
                        app.overdue2_customers = response.data.users;
                    }
                });
        },

        get31DaysOverdue: function () {
            axios.get("https://altara-api.herokuapp.com/api.php?action=overdue3")
                .then(function (response) {
                    app.dataloaded = false;
                    /*   console.log(response); */
                    if (response.data.error) {
                        app.errorMessage = response.data.message;
                    } else {
                        app.overdue3_customers = response.data.users;
                    }
                });

        },


        downloadCustomerData: function () {
            app.dataloaded = true;
            console.log(app.Regdate);

            axios.post("https://altara-api.herokuapp.com/api.php?action=download", {
                RegDate: app.Regdate

            }, { responseType: 'blob' }, {
                    headers: {
                        'Accept': 'Content-Type: text/csv',
                    }
                })
                .then(function (response) {
                    download(response.data, app.Regdate + 'customerdata.csv');
                    app.Regdate = "";
                    app.dataloaded = false;
                });
        },

        Checkdate: function (startDate, endDate) {
            var date1 = new Date(endDate);
            var date2 = new Date(startDate);

            if (startDate == '' || endDate == '') {
                app.errorMessageChk = "Field can't be empty";
                setTimeout(function () {
                    app.errorMessageChk = '';
                }, 1000);
                return false
            }
            else if (((date1.setHours(0, 0, 0, 0)) <= (date2.setHours(0, 0, 0, 0))) || (Number(app.diffDays) > 7)) {
                app.errorMessageChk = "InValid Date Range, Hint: StartDate must be greater than Enddate and Date difference must not exceed 6";
                setTimeout(function () {
                    app.errorMessageChk = '';
                }, 1000);
                return false
            }
            else return true


        },

        downloadDeposite: function (startDate, endDate) {
            console.log(startDate + '  ' + endDate )
            if (app.Checkdate(startDate, endDate)) {

                axios.post("https://altara-api.herokuapp.com/api.php?action=download_dep", {
                    startDate: startDate,
                    endDate: endDate

                }, { responseType: 'blob' }, {
                    headers: {
                        'Accept': 'Content-Type: text/csv',
                    }
                })
                .then(function(response) {
                    if (response.data){
                        download(response.data,  'Deposite from '+ startDate + 'to '+ endDate + '.csv');
                    }
                    else{
                        app.errorMessageChk = "Error - Contact Support";
                setTimeout(function () {
                    app.errorMessageChk = '';
                }, 1000);
                    }
                    app.dataloaded = false;
                });
            }
            else {

            }
        },

        downloadInvoice: function (startDate, endDate) {
            console.log(startDate + '  ' + endDate )
            if (app.Checkdate(startDate, endDate)) {

                axios.post("https://altara-api.herokuapp.com/api.php?action=download_inv", {
                    startDate: startDate,
                    endDate: endDate

                }, { responseType: 'blob' }, {
                    headers: {
                        'Accept': 'Content-Type: text/csv',
                    }
                })
                .then(function(response) {
                    if (response.data){
                    download(response.data,  'Sales Invoice from '+ startDate + 'to '+ endDate + '.csv');
                    }
                    else{
                        app.errorMessageChk = "Error - Contact Support";
                setTimeout(function () {
                    app.errorMessageChk = '';
                }, 1000);
                    }
                    app.dataloaded = false;
                });
            }
            else {

            }
        },


        ApproveCustomer: function (name, telnumber) {

            console.log(app.Customer_id)
            if (app.checKiD.length == 1) {

                axios.post("https://altara-api.herokuapp.com/api.php?action=approve", {
                    Customer_id: app.Customer_id
                })
                    .then(function (response) {
                        console.log(response);

                        if (response.data.error) {
                            app.submitted = false;
                            app.errorMessage = response.data.message;

                            setTimeout(function () {
                                app.errorMessage = '';
                            }, 1000);

                        } else {
                            app.submitted = false;
                            app.successMessage = response.data.message;
                            app.sendNotification(name, telnumber)
                            setTimeout(function () {
                                app.successMessage = '';
                            }, 1000);

                        }
                    });
            } else {
                app.errorMessage = "Customer ID Doesnt Exist";

                setTimeout(function () {
                    app.errorMessage = '';

                }, 1000);

            }


        },

        CheckId: function () {

            app.dataloaded = true;
            axios.post("https://altara-api.herokuapp.com/api.php?action=checkId", {
                Customer_id: app.Customer_id
            })
                .then(function (response) {
                    console.log(response);
                    app.dataloaded = false;
                    if (response.data.error) {
                        app.errorMessage = response.data.message;

                        setTimeout(function () {
                            app.errorMessage = '';
                        }, 1000);

                    } else {
                        app.checKiD = response.data.checklist;
                        if (app.checKiD.length != 0) {
                            app.CustName = response.data.checklist[0].first_name
                            app.phoneNo = response.data.checklist[0].telephone
                        }
                        app.ApproveCustomer(app.CustName, app.phoneNo);
                        app.Customer_id = "";
                    }
                });
        },


        resetMessage: function () {
            app.errorMessage = "";
            app.successMessage = "";
        },

        updateComment: function () {

            if (app.comment.Res == undefined || app.comment.Comment == undefined) {
                app.errorMessage = "Fill in all fields before submission";
                setTimeout(function () {
                    app.errorMessage = '';
                }, 2000);
            } else {
                app.comment.Comment = app.comment.Res + ", " + app.comment.Comment;
                var formData = app.toFormData(app.comment);

                axios.post("https://altara-api.herokuapp.com/api.php?action=comment", formData)
                    .then(function (response) {
                        console.log(response);
                        app.comment = {};
                        if (response.data.error) {
                            app.errorMessage = response.data.message;
                            /*     app.clearMessage(); */
                        } else {
                            app.getReminderSMS();
                            app.get1DayOverdue();
                            app.get16DaysOverdue();
                            app.get31DaysOverdue();
                            app.successMessage = response.data.message;
                            setTimeout(function () {
                                app.successMessage = '';

                            }, 2000);

                        }
                    });
            }
        },

        selectUser(comment_id) {
            app.comment.Transaction_id = comment_id;
            console.log(app.comment.Transaction_id);
        },

        toFormData: function (obj) {
            var form_data = new FormData();
            for (var key in obj) {
                form_data.append(key, obj[key]);
            }
            return form_data;
        },


        sendNotification(name, telnumber) {
            telnumber = telnumber.substr(1);
            let message = "Dear " + name + ", Congratulations, You have been approved. Come to the store to make a purchase. Altara Credit Limited.";
            // axios.get("http://api.smartsmssolutions.com/smsapi.php?username=bjmarcson&password=fabregas10&sender=Altara&recipient=" + telnumber + "&message=" + message + "")
            axios.get("https://api.infobip.com/sms/1/text/query?username=Oluwatoke12&password=Altara99&to=" + 234 + telnumber + "&text=" + message + "")

                .then(function (response2) {
                    console.log(response2);
                    if (response2.status == 200) {
                        app.successMessage = "Notification sent to Customer";

                        setTimeout(function () {
                            app.successMessage = '';
                        }, 2000);
                        // updateRemark(Updata)
                    } else {
                        app.errorMessage = "Error Sending Message, Contact Support";
                    }
                });
        }

    }
});