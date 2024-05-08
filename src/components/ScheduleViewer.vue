<template>
  <a-float-button type="primary" style="height: 60px; width: 60px" @click="eventEditOverlayVisible = !eventEditOverlayVisible">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="filterSettings.search"></a-input>
  </div>

  <div>
    <a-flex justify="space-around" align="middle" gap="middle">
      <a-input size="large" addonBefore="Start Date" v-model="startDate" type="date"></a-input>
      <a-input size="large" addonBefore="End Date" v-model="endDate" type="date"></a-input>
    </a-flex>
    <a-button @click="getCombineScheduleData(startDate, endDate)" size="large">Load Selected Dates</a-button>
  </div>

  <a-alert message="Error" :description="getSchedulesErrorMessage" type="error" class="mb-2" v-if="getSchedulesErrorMessage != ''" />

  <div v-for="site in Object.keys(combinedSchedules).sort((a, b) => (objectifiedEventTemplates[a].title > objectifiedEventTemplates[b].title ? 1 : -1))" :key="site">
    <a-card v-if="Object.keys(combinedSchedules[site]).length > 0 && objectifiedEventTemplates[site].title.toLowerCase().includes(filterSettings.search.toLowerCase())" :title="objectifiedEventTemplates[site].title">
      <div a-show="show[site]">
        <a-divider></a-divider>

        <a-card v-for="date in Object.keys(combinedSchedules[site]).sort((a, b) => (new Date(date + ' ' + a.split(' - ')[0]).getTime() > new Date(date + ' ' + b.split(' - ')[0]).getTime() ? 1 : -1))" :key="date" :title="new Date(date).toDateString()">
          <div v-for="time in Object.keys(combinedSchedules[site][date]).sort((a, b) => (new Date(date + ' ' + a.split(' - ')[0]).getTime() > new Date(date + ' ' + b.split(' - ')[0]).getTime() ? 1 : -1))" :key="time">
            <div>
              <div>
                <span>{{ time }}</span>
                <span style="float: right">{{ combinedSchedules[site][date][time].length }}</span>
              </div>
            </div>
            <div>
              <a-tag v-for="schedule in Object.keys(combinedSchedules[site][date][time])" :key="schedule" :color="objectifiedScheduleCategories[objectifiedSchedules[schedule].scheduleCategoryID].color" @click="configureEventForm(objectifiedEvents[combinedSchedules[site][date][time][schedule].eventID])">
                {{ objectifiedSchedules[schedule].title }}
              </a-tag>
            </div>
          </div>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup></script>

<script></script>
