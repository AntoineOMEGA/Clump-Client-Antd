<template>
  <a-drawer v-model:open="eventEditOverlayVisible" @close="resetEventForm()">
    <a-spin :spinning="eventSpinning">
      <a-form>
        <div class="mb-2" v-if="!eventFormData._id">
          Event Template
          <a-select v-on:change="applyEventTemplate(eventFormData.eventTemplateID)"
            v-model:value="eventFormData.eventTemplateID" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))"
              :value="eventTemplate._id" :key="eventTemplate._id">{{ eventTemplate.title }}</a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          Title
          <a-input size="large" v-model:value="eventFormData.title" allowClear></a-input>
        </div>

        <div class="mb-2">
          Location
          <a-input size="large" v-model:value="eventFormData.location" allowClear></a-input>
        </div>

        <div class="mb-2">
          Description
          <a-textarea size="large" v-model:value="eventFormData.description" allowClear></a-textarea>
        </div>

        <div class="mb-2">
          Time Zone
          <a-select v-model:value="eventFormData.timeZone" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="timeZone in timeZones" :value="timeZone" :key="timeZone">
              {{ timeZone }}
            </a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          <a-flex justify="space-around" align="middle" gap="middle">
            <div>
              Start Time
              <a-time-picker size="large" v-model:value="eventFormData.startTime" format="h:mm A" :minute-step="5"
                allowClear></a-time-picker>
            </div>
            <div>
              End Time
              <a-time-picker size="large" v-model:value="eventFormData.endTime" format="h:mm A" :minute-step="5"
                allowClear></a-time-picker>
            </div>
          </a-flex>
        </div>

        <div class="mb-2">
          <a-flex justify="space-around" align="middle" gap="middle">
            <div>
              Start Date
              <a-date-picker size="large" v-model:value="eventFormData.startDate" format="MM-DD-YYYY"
                allowClear></a-date-picker>
            </div>
            <div>
              End Date
              <a-date-picker size="large" v-model:value="eventFormData.endDate" format="MM-DD-YYYY"
                allowClear></a-date-picker>
            </div>
          </a-flex>
        </div>

        <div v-if="eventFormData._id" class="mb-2">
          Attendees
          <a-select v-model:value="attendees" size="large" style="width: 100%" allowClear mode="multiple">
            <a-select-option v-for="schedule in schedules.sort()" :value="schedule._id" :key="schedule._id">
              {{ schedule.title }}
            </a-select-option>
          </a-select>
        </div>

        <a-button type="primary" style="margin: 10px" @click="recurrenceRuleModalVisible = true">Repeat Event</a-button>
      </a-form>

      //Recurrence Rule Form
      <a-modal v-model:open="recurrenceRuleModalVisible" title="Recurrence Rule">
        <div class="mb-2">
          Frequency
          <a-select v-model:value="recurrenceRuleFormData.frequency" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="option in recurrenceRuleOptions.frequency" :value="option" :key="option">
              {{ option }}
            </a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          Interval
          <a-input type="number" v-model:value="recurrenceRuleFormData.interval" allowClear></a-input>
        </div>

        <div v-if="['Yearly by day', 'Yearly by date'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
          Month
          <a-select v-model:value="recurrenceRuleFormData.ByMonth" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="month in Object.keys(recurrenceRuleOptions.ByMonth)" :value="month" :key="month">
              {{ month }}
            </a-select-option>
          </a-select>
        </div>

        <div v-if="['Monthly by day', 'Yearly by day'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
          Occurrences of Week Days in Month
          <a-select v-model:value="recurrenceRuleFormData.ByDayMonthly" size="large" style="width: 100%" allowClear
            mode="multiple">
            <a-select-option v-for="monthDay in Object.keys(generatedMonthDays)" :value="monthDay" :key="monthDay">
              {{ monthDay }}
            </a-select-option>
          </a-select>
        </div>

        <div v-if="['Weekly'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
          Days of Week
          <a-select v-model:value="recurrenceRuleFormData.byDay" size="large" style="width: 100%" allowClear
            mode="multiple">
            <a-select-option v-for="weekDay in Object.keys(recurrenceRuleOptions.byDay)" :value="weekDay"
              :key="weekDay">
              {{ weekDay }}
            </a-select-option>
          </a-select>
        </div>

        <div v-if="['Monthly by date', 'Yearly by date'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
          Day in Month
          <a-select v-model:value="recurrenceRuleFormData.byMonthDay" size="large" style="width: 100%" allowClear
            mode="multiple">
            <a-select-option v-for="dayInMonth in Object.keys(recurrenceRuleOptions.ByMonthDay)" :value="dayInMonth"
              :key="dayInMonth">
              {{ dayInMonth }}
            </a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          End
          <a-radio-group v-model:value="recurrenceRuleFormData.end" option-type="button"
            :options="recurrenceRuleOptions.endOptions" style="display: block" />
        </div>

        <div v-if="recurrenceRuleFormData.end == 'Occurrences'" class="mb-2">
          Occurrences
          <a-input type="number" v-model:value="recurrenceRuleFormData.occurrences" allowClear></a-input>
        </div>

        <div v-if="recurrenceRuleFormData.end == 'Until Date'" class="mb-2">
          Until Date
          <a-date-picker size="large" v-model:value="recurrenceRuleFormData.untilDateTime" format="MM-DD-YYYY"
            style="width: 100%" allowClear></a-date-picker>
        </div>
      </a-modal>

      <a-alert message="Error" :description="eventFormErrorMessage" type="error" class="mb-2"
        v-if="eventFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle" class="mb-2">
        <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block @click="updateDecision()">Save</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block danger
          @click="deleteDecision()">Delete</a-button>
      </a-flex>

      <a-popover v-model:open="eventUpdatePopoverVisible" title="Update Instances" trigger="click">
        <template #content>
          <a-button type="primary" style="margin: 10px" @click="updateThisEvent()">This Event</a-button>
          <a-button type="primary" style="margin: 10px" @click="updateThisAndFollowingEvents()">This and Following
            Events</a-button>
          <a-button type="primary" style="margin: 10px" @Click="updateAllEvents()">All Events</a-button>
        </template>
      </a-popover>

      <a-popover v-model:open="eventDeletePopoverVisible" title="Delete Instances" trigger="click">
        <template #content>
          <a-button type="primary" style="margin: 10px" @click="deleteThisEvent()">This Event</a-button>
          <a-button type="primary" style="margin: 10px" @click="deleteThisAndFollowingEvents()">This and Following
            Events</a-button>
          <a-button type="primary" style="margin: 10px" @click="deleteAllEvents()">All Events</a-button>
        </template>
      </a-popover>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined, CaretRightOutlined, CaretLeftOutlined, ShareAltOutlined, UserDeleteOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>