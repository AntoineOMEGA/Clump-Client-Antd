<template>
  <a-modal :open="visible" @ok="confirmRecurrenceRule()" @cancel="close()" title="Recurrence Rule">
    <div class="mb-2">
      Start Time
      <a-time-picker size="large" v-model:value="eventFormData.startTime" format="h:mm A" :minute-step="5" allowClear></a-time-picker>
    </div>

    <div class="mb-2">
      End
      <a-radio-group v-model:value="recurrenceRuleFormData.end" option-type="button" :options="recurrenceRuleOptions.endOptions" style="display: block" />
    </div>

    <div v-if="recurrenceRuleFormData.end == 'Until Date'" class="mb-2">
      Until Date
      <a-date-picker size="large" v-model:value="recurrenceRuleFormData.untilDateTime" format="MM-DD-YYYY" style="width: 100%" allowClear></a-date-picker>
    </div>

    <a-flex justify="space-around" align="middle" gap="middle" class="mb-2">
      <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
      <a-button v-if="eventFormData._id" type="primary" size="large" block @click="updateDecision()">Save</a-button>
      <a-button v-if="eventFormData._id" type="primary" size="large" block danger @click="deleteDecision()">Delete</a-button>
    </a-flex>

    <a-popover v-model:open="eventUpdatePopoverVisible" title="Update Instances" trigger="click">
      <template #content>
        <a-button type="primary" style="margin: 10px" @click="updateThisEvent()">This Event</a-button>
        <a-button type="primary" style="margin: 10px" @click="updateThisAndFollowingEvents()">This and Following Events</a-button>
        <a-button type="primary" style="margin: 10px" @Click="updateAllEvents()">All Events</a-button>
      </template>
    </a-popover>

    <a-popover v-model:open="eventDeletePopoverVisible" title="Delete Instances" trigger="click">
      <template #content>
        <a-button type="primary" style="margin: 10px" @click="deleteThisEvent()">This Event</a-button>
        <a-button type="primary" style="margin: 10px" @click="deleteThisAndFollowingEvents()">This and Following Events</a-button>
        <a-button type="primary" style="margin: 10px" @click="deleteAllEvents()">All Events</a-button>
      </template>
    </a-popover>
  </a-modal>
</template>

<script setup>
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() {},
  updated() {
    if (this.visible) {
      this.configureForm();
    }
  },
  props: ['visible', 'recurrenceRule'],
  emits: ['close', 'confirmRecurrenceRule'],
  data() {
    return {
      recurrenceRuleOptions: {
        endOptions: ['Not Set', 'Until Date']
      },
      recurrenceRuleFormData: {}
    };
  },
  methods: {
    configureForm() {
      if (this.recurrenceRule.untilDateTime) {
        this.recurrenceRuleFormData.end = 'Until Date';
        this.recurrenceRuleFormData.untilDateTime = dayjs(this.recurrenceRule.untilDateTime);
      }
    },
    close() {
      this.$emit('close');
    },
    confirmRecurrenceRule() {
      let newRecurrenceRule = {
        frequency: this.recurrenceRuleFormData.frequency
      };

      if (this.recurrenceRuleFormData.end == 'Until Date') {
        newRecurrenceRule.untilDateTime = this.recurrenceRuleFormData.untilDateTime;
      }

      this.$emit('confirmRecurrenceRule', newRecurrenceRule);
    }
  }
};
</script>
