<template>

    <div>
        <div class="relative">
            <card-student-profile :profileData="studentProfile"/>
            <button @click="openStudentAddEditModal(student)" class="absolute p-2 top-4 right-4 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
        </div>
        <div class="mt-8 text-center">
            <div class="px-4 mb-2 text-left">
                <button class="inline-flex items-center text-gray-600 hover:text-gray-700" @click="openResultAddEditModal">
                    <span>Create Result</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>
            <card-student-results
            v-if="student"
            :initRows="student.results"
            :studentId="student.id"
            @sort="sortOptionsToggle"
            @dateRange="dateFilerSeleted"
            @toggleRangeFilter="toggleRangeFilter"/>
        </div>
        <div class="mt-6 text-center">
            <button class="font-normal text-gray-600 hover:text-gray-800"
            v-if="student && student.results && student.results.next_page_url"
            @click.prevent="loadmore(
                student.results,
                {
                    name: 'student/get',
                    params: {
                        id: student.id
                    },
                    query: {
                        results: true,
                        ...sortOptionsToKeyStingValue(sortOptions['result'])
                    }
                },
                'results'
            )"
            >
              Load more
            </button>
        </div>

        <student-add-edit
            :modalData="studentAddEditModalData"
            :transfer="true"
            v-if="studentAddEditModalData.show"
            @close="closeStudentAddEditModal"
            @saveSync="syncStudent"
            :disableDepartment="false"
            :disableBatch="false"
        />
        <ResultAddEdit
            :modalData="resultAddEditModalData"
            v-if="resultAddEditModalData.show"
            @close="closeResultAddEditModal"
            @saveSync="syncResult"
        />
    </div>
</template>

<script>
import SortableOptionToggle from '@/mixins/sortableOptionToggle'
import ForwardPagination from '@/mixins/forwadPagination'

import CardStudentProfile from '@/components/Cards/CardStudentProfile'
import CardStudentResults from '@/components/Cards/CardStudentResults'

import StudentAddEdit from '@/components/Modals/StudentAddEdit_v2'
import StudentAddEditMixin from '@/mixins/studentAddEditModal'

import ResultAddEdit from '@/components/Modals/ResultAddEdit'
import ResultAddEditMixin from '@/mixins/resultAddEdit'

export default {
    components: {
        CardStudentProfile,
        CardStudentResults,
        StudentAddEdit,
        ResultAddEdit
    },
    mixins: [
        ForwardPagination,
        SortableOptionToggle,
        StudentAddEditMixin,
        ResultAddEditMixin
    ],
    data() {
        return {
            student: null,
            dateRangeFilter: {
                active: false,
                query: {
                    toDate: '',
                    fromDate: '',
                }
            }
        }
    },
    watch: {
        student(val) {
            if(!val) return

            this.setupStudentAddEdit({
                department: this.student.department,
                batch: this.student.batch
            })
            this.setupResultAddEdit({
                student:{ id: this.student.id, name: this.student.name }
            })
        }
    },
    computed: {
        studentProfile() {
            return {
                name: this.student ? this.student.name : '',
                department: this.student ? this.student.department.id + ' | ' + this.student.department.name : '',
                batch: this.student ? this.student.batch.id + ' | ' + this.student.batch.name : ''
            }
        },
        results() {
            if(!this.student) return null
            return this.student.results
        },
    },
    methods: {
        fetchPageMasterData() {
            this.$store.dispatch('student/get', {
                id: this.$route.params.id,
                queryObject: {
                    results: true,
                    dateRange: this.dateRangeFilter.active,
                    ...this.dateRangeFilter.query,
                    ...this.sortOptionsToKeyStingValue(this.sortOptions['result'])
                }
            })
            .then(res => {
                console.log('batch single: ', res)
                this.student = res

            })
        },
        syncStudent(data) {
            this.student.name = data.name
        },
        syncResult(data) {
            const index = this.student.results.data.findIndex(item => item.id == data.id)
            if(index != -1) {
                this.student.results.data.splice(index, 1, data)
            } else {
                this.student.results.data.push(data)
            }
        }
        ,
        dateFilerSeleted(data) {
            if(data == 'clear') {
                this.dateRangeFilter.query.toDate = ''
                this.dateRangeFilter.query.fromDate = ''
            } else {
                if(data.to) {
                    this.dateRangeFilter.query.toDate = data.to
                } else if(data.from) {
                    this.dateRangeFilter.query.fromDate = data.from
                }
            }

            if(this.dateRangeFilter.active) {
                this.fetchPageMasterData()
            }
        },
        toggleRangeFilter(data) {
            this.dateRangeFilter.active = data.target.checked
            this.fetchPageMasterData()
        }

    },
    created() {
        this.fetchPageMasterData()

        // related to sort mixin
        this.sortOptions.callbacks.push({ group: 'result', cb: this.fetchPageMasterData })
    }
}
</script>

<style>

</style>