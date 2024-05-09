<template>
  <a-float-button type="primary" style="height: 60px; width: 60px"
    @click="eventEditOverlayVisible = !eventEditOverlayVisible">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="filterSettings.search"></a-input>
  </div>

  <div>
    <a-flex justify="space-around" align="middle" gap="middle"
      style="padding: 5px; margin: 10px; background-color: #333333; border-radius: 10px">
      <a-date-picker placeholder="Start Date" format="MM-DD-YY" size="large"></a-date-picker>
      <a-date-picker placeholder="End Date" format="MM-DD-YY" size="large"></a-date-picker>
      <a-button @click="getCombineScheduleData(startDate, endDate)" size="large" type="primary">Load</a-button>
    </a-flex>
  </div>

  <a-alert message="Error" :description="getSchedulesErrorMessage" type="error" class="mb-2"
    v-if="getSchedulesErrorMessage != ''" />

  <a-card style="margin: 10px; background-color: #333333">
    <a-statistic title="Total Hours" :value="480">
      <template #suffix>
        <ClockCircleOutlined />
      </template>
    </a-statistic>
  </a-card>

  <div>
    <a-card v-for="i in 3" :key="i" style="margin: 10px" title="Family Search Center" :bodyStyle="{ padding: '0' }">
      <template #extra>
        <EyeOutlined style="font-size: 1.5rem" key="edit" @click="exampleViewOpen = !exampleViewOpen" />
      </template>
    </a-card>
  </div>

  <a-drawer v-model:open="exampleViewOpen">
    <a-card style="margin-bottom: 20px; background-color: #333333">
      <a-statistic title="Total Hours" :value="480">
        <template #suffix>
          <ClockCircleOutlined />
        </template>
      </a-statistic>
    </a-card>

    <a-card title="Tuesday 17th, March 2024" :bodyStyle="{ padding: '5px' }"
      style="margin-bottom: 10px; background-color: #333">
      <a-card title="9:00am - 12:00pm | Shift" :bodyStyle="{ padding: '5px' }" style="margin-bottom: 5px">
        <template #extra>
          <a-badge color="#22a2ff" count="4" style="color: #fff">
            <UserOutlined style="font-size: 1.2rem" />
          </a-badge>
        </template>
        <a-card title="9:00am - 11:00am" style="background-color: #333" :bodyStyle="{ padding: '5px' }">
          <a-tag color="#ffb7f5"
            style="margin: 5px; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 10px"
            @click="console.log('hi')">Bart.Anthony</a-tag>
        </a-card>
        <a-card title="9:00am - 12:00pm" style="background-color: #333" :bodyStyle="{ padding: '5px' }">
          <a-tag color="#ffb735"
            style="margin: 5px; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 10px">Black.Tom</a-tag>
        </a-card>
      </a-card>
      <a-card title="1:00 - 4:00pm" :bodyStyle="{ padding: '5px' }" style="margin-bottom: 5px">
        <template #extra>
          <a-badge color="#22a2ff" count="4" style="color: #fff">
            <UserOutlined style="font-size: 1.2rem" />
          </a-badge>
        </template>
        <a-tag color="#ffb7f5"
          style="margin: 5px; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 10px">Bart.Anthony</a-tag>

      </a-card>
    </a-card>

    <a-float-button type="primary" style="height: 60px; width: 60px"
      @click="eventEditOverlayVisible = !eventEditOverlayVisible">
      <template #icon>
        <PlusOutlined style="font-size: 20px" />
      </template>
    </a-float-button>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EyeOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  mounted() {

  },
  data() {
    return {
      exampleViewOpen: false,
      schedules: [],
      eventTemplates: [],
      eventEditOverlayVisible: false,
      eventEditAdvanced: false,
      eventFormData: {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        recurrence: {
          frequency: 'Once',
          interval: 0,
          count: 0,
          byDay: [],
          byDayMonthly: [],
          byMonth: 0,
          byMonthDay: [0]
        },
        until: '',
        scheduleID: '',
        eventTemplateID: '',
        shiftID: ''
      },
      eventFormErrorMessage: '',
      getSchedulesErrorMessage: '',
      filterSettings: {
        search: ''
      },
      timeZones: new Intl.Locale('en-US').timeZones,
      recurrenceRuleOptions: {
        freq: ['Once', 'Daily', 'Weekly', 'Monthly by Day', 'Monthly by Date', 'Yearly by Day', 'Yearly by Date'],
        advFreq: {
          ByDay: {
            Monday: 'MO',
            Tuesday: 'TU',
            Wednesday: 'WE',
            Thursday: 'TH',
            Friday: 'FR',
            Saturday: 'SA',
            Sunday: 'SU'
          },
          ByDayExtended: { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, Last: -1 },
          ByMonthDay: {
            '1st': 1,
            '2nd': 2,
            '3rd': 3,
            '4th': 4,
            '5th': 5,
            '6th': 6,
            '7th': 7,
            '8th': 8,
            '9th': 9,
            '10th': 10,
            '11th': 11,
            '12th': 12,
            '13th': 13,
            '14th': 14,
            '15th': 15,
            '16th': 16,
            '17th': 17,
            '18th': 18,
            '19th': 19,
            '20th': 20,
            '21st': 21,
            '22nd': 22,
            '23rd': 23,
            '24th': 24,
            '25th': 25,
            '26th': 26,
            '27th': 27,
            '28th': 28,
            '29th': 29,
            '30th': 30,
            '31st': 31
          },
          ByMonth: {
            January: 1,
            February: 2,
            March: 3,
            April: 4,
            May: 5,
            June: 6,
            July: 7,
            August: 8,
            September: 9,
            October: 10,
            November: 11,
            December: 12
          }
        }
      }
    };
  },
  methods: {
    resetForm() {
      this.eventEditOverlayVisible = false;
      this.eventEditAdvanced = false;
      this.eventFormData = {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        recurrence: {
          frequency: 'Once',
          interval: 0,
          count: 0,
          byDay: [],
          byDayMonthly: [],
          byMonth: 0,
          byMonthDay: [0]
        },
        until: '',
        scheduleID: '',
        eventTemplateID: ''
      };
      this.eventFormErrorMessage = '';
    },
    configureEventForm(event) {
      this.eventFormData._id = event._id;
      this.eventFormData.title = event.title;
      this.eventFormData.description = event.description;
      this.eventFormData.location = event.location;

      this.eventFormData.startDate = new Date(event.startDateTime).toISOString().substring(0, 10);
      this.eventFormData.endDate = new Date(event.endDateTime).toISOString().substring(0, 10);
      this.eventFormData.startTime = this.convertTocalTime(new Date(event.startDateTime).toLocaleTimeString('it-IT').substring(0, 5));
      this.eventFormData.endTime = this.convertToLocalTime(new Date(event.endDateTime).toLocaleTimeString('it-IT').substring(0, 5));

      this.eventFormData.recurrence = event.recurrence;

      this.eventFormData.scheduleID = event.scheduleID;
      this.eventFormData.eventTemplateID = event.eventTemplateID;
      this.eventFormData.shiftID = event.shiftID;

      this.eventEditOverlayVisible = true;
      this.eventEditAdvanced = false;
    }
  }
};
</script>
