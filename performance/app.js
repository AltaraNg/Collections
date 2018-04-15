Vue.component('line-chart', {
    extends: VueChartJs.Line,
    mounted() {
        this.renderChart({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Data One',
                    backgroundColor: '#f87979',
                    data: [40, 39, 10, 40, 39, 80, 40]
                }
            ]
        }, { responsive: false, maintainAspectRatio: false, })
    },

})

const ERRORS = {
    required: 'This field is required.',
    minLength: 'The length should be minimum 8 characters.',
    invalidEmail: 'This is not a valid email address.',
    invalidTel: 'This is not a valid Telephone Number.'
}
var app = new Vue({
    el: '#root',
    data: {
        search: '',
        errorMessageChk: '',
        successMessageChk: '',
        CheckCusId: "",
        register: false,
        loaded: false,
        hide: true,
        Personal_Guarantor: '',
        Work_Guarantor: '',
        List_dsa: [],
        startDate: '',
        endDate: '',
        EmpAverage: [],
        diffInDays: null,
    },

    mounted: function () {
        console.log('mounted');
        // this.ListCustomers();
    },

    computed: {
        filteredList_customers: function () {
            return this.list_customers.filter((list_customer) => {
                return list_customer.first_name.match(this.search) + list_customer.last_name.match(this.search);
            });
        },

    },

    methods: {

        ListCustomers: function () {
            var date1 = new Date(app.startDate);
            var date2 = new Date(app.endDate);

            if (app.startDate == '' || app.endDate == '') {
                app.errorMessageChk = "Field can't be empty";
                setTimeout(function () {
                    app.errorMessageChk = '';
                }, 1000);

            }
            else {

                var timeDiff = Math.abs(date1.getTime() - date2.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                app.diffInDays = diffDays;
                console.log((date1.setHours(0, 0, 0, 0)));
                console.log((date2.setHours(0, 0, 0, 0)));
                if (((date1.setHours(0, 0, 0, 0)) <= (date2.setHours(0, 0, 0, 0))) || (Number(app.diffDays) > 7)) {
                    app.errorMessageChk = "InValid Date Range, Hint: StartDate must be greater than Enddate and Date difference must not exceed 6";
                    setTimeout(function () {
                        app.errorMessageChk = '';
                    }, 1000);
                }
                else
                    axios.post("https://altara-api.herokuapp.com/api.php?action=rate",
                        {
                            startDate: app.startDate,
                            endDate: app.endDate
                        })
                        .then(function (response) {
                            console.log(response);
                            if (response.data.error) {
                                app.errorMessage = response.data.message;
                            } else {
                                app.List_dsa = response.data.users;
                                app.loaded = true;
                                console.log(app.List_dsa);
                                var cloneList = response.data.users;
                                // app.removedate(cloneList);
                                app.computeTotal(cloneList);

                            }
                        });
            }
        },

        removedate: function (arr) {
            arr.forEach(function (obj) { delete obj.day });
            console.log(arr);
            app.computeTotal(arr);
        },

        Total: function (arr, val) {
            Array.prototype.sum = function (prop) {
                var total = 0
                for (var i = 0, _len = this.length; i < _len; i++) {
                    total += Number(this[i][prop]);
                }
                console.log(total);
                return total

            }
            console.log(arr.sum(val));
            return arr.sum(val);

        },

        computeTotal: function (arr) {
            if (Object.keys(arr[0])) {

                var newarr = Object.keys(arr[0]);
                var arr3 = [];
                for (i = 0; i <= newarr.length - 1; i++) {
                    var e = this.Total(arr, newarr[i]);
                    console.log(e)
                    arr3.push(e);
                }
                arr3.pop();
                app.EmpAverage = arr3;
                console.log(app.EmpAverage);
            }
        }
    },
});