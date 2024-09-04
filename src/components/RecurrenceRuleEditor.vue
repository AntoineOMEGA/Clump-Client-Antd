<template>
  <a-modal :open="visible" @close="close()" title="Recurrence Rule">
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
        <a-select-option v-for="weekDay in Object.keys(recurrenceRuleOptions.byDay)" :value="weekDay" :key="weekDay">
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
</template>

<script>
export default {
  mounted() { },
  props: ['visible', 'recurrenceRule'],
  emits: ['close', 'confirmRecurrenceRule'],
  data() {
    return {
      recurrenceRuleOptions: {
        frequency: ['Daily', 'Weekly', 'Monthly by day', 'Monthly by date', 'Yearly by day', 'Yearly by date'],
        byDay: {
          Monday: 'MO',
          Tuesday: 'TU',
          Wednesday: 'WE',
          Thursday: 'TH',
          Friday: 'FR',
          Saturday: 'SA',
          Sunday: 'SU'
        },
        byWeekInMonth: { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, Last: -1 },
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
        },
        endOptions: ['Not Set', 'Until Date', 'Occurrences']
      },
      recurrenceRuleFormData: this.recurrenceRule
    };
  },
  computed: {
    generatedMonthDays() {
      let monthDays = {};
      for (let dayExtended of Object.keys(this.recurrenceRuleOptions.byWeekInMonth)) {
        for (let day of Object.keys(this.recurrenceRuleOptions.byDay)) {
          monthDays[dayExtended + ' ' + day] = this.recurrenceRuleOptions.byWeekInMonth[dayExtended] + this.recurrenceRuleOptions.byDay[day];
        }
      }
      return monthDays;
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    confirmRecurrenceRule() {
      this.$emit('confirmRecurrenceRule', this.recurrenceRuleFormData);
    }
  }
};
</script>
