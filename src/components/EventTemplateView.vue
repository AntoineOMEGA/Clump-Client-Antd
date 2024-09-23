<template>
  <a-float-button type="primary" style="height: 60px; width: 60px" @click="eventTemplateEditOverlayVisible = !eventTemplateEditOverlayVisible">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="eventTemplateFilterSettings.search"></a-input>
  </div>

  <a-spin :spinning="eventTemplateLoadSpinning">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))" :key="eventTemplate._id">
        <a-card style="margin: 10px" v-if="eventTemplate.title.toLowerCase().includes(eventTemplateFilterSettings.search.toLowerCase())" :title="eventTemplate.title" :bodyStyle="{ padding: '0' }">
          <template #extra>
            <EditOutlined style="font-size: 1.5rem" key="edit" @click="configureUpdateEventTemplateForm(eventTemplate)" />
          </template>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>

  <a-drawer v-model:open="eventTemplateEditOverlayVisible" @close="resetEventTemplateForm()">
    <a-spin :spinning="eventTemplateSpinning">
      <a-form>
        <div class="mb-2">
          Title
          <a-input v-model:value="eventTemplateFormData.title" size="large"></a-input>
        </div>

        <div class="mb-2">
          Location
          <a-input v-model:value="eventTemplateFormData.location" size="large"></a-input>
        </div>

        <div class="mb-2">
          Description
          <a-textarea :auto-size="{ minRows: 2, maxRows: 6 }" v-model:value="eventTemplateFormData.description"></a-textarea>
        </div>

        <a-card v-if="eventTemplateFormErrorMessage != ''">
          <a-card-meta :title="eventTemplateFormErrorMessage"></a-card-meta>
        </a-card>

        <a-flex justify="space-around" align="middle" gap="middle">
          <a-button type="primary" size="large" block v-if="!eventTemplateFormData._id" @click="createEventTemplate()">Create</a-button>
          <a-button type="primary" size="large" block v-if="eventTemplateFormData._id" @click="updateEventTemplate()">Save</a-button>
          <a-button type="primary" size="large" block v-if="eventTemplateFormData._id" @click="deleteEventTemplate()">Delete</a-button>
        </a-flex>
      </a-form>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { EditOutlined, PlusOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  mounted() {
    this.getEventTemplates();
  },
  data() {
    return {
      eventTemplateEditOverlayVisible: false,
      eventTemplateLoadSpinning: false,
      eventTemplateSpinning: false,
      eventTemplateFormData: {
        title: '',
        location: '',
        description: ''
      },
      eventTemplateFormErrorMessage: '',
      eventTemplates: [],
      eventTemplateFilterSettings: {
        search: ''
      },
      toggleMoreDetails: false
    };
  },
  methods: {
    getEventTemplates() {
      this.eventTemplateLoadSpinning = true;
      fetch('/api/v1/event-templates', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.eventTemplates = data.data.eventTemplates;
          }
          this.eventTemplateLoadSpinning = false;
        });
      });
    },
    resetEventTemplateForm() {
      this.eventTemplateSpinning = false;
      this.eventTemplateFormData = {
        title: '',
        location: '',
        description: ''
      };
      this.eventTemplateEditOverlayVisible = false;
      this.eventTemplateFormErrorMessage = '';
    },
    createEventTemplate() {
      this.eventTemplateSpinning = true;
      fetch('/api/v1/event-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.eventTemplateFormData.title,
          location: this.eventTemplateFormData.location,
          description: this.eventTemplateFormData.description
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.eventTemplates.push(data.data.eventTemplate);
            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
            this.eventTemplateSpinning = false;
          }
        });
      });
    },
    configureUpdateEventTemplateForm(eventTemplate) {
      this.eventTemplateFormData._id = eventTemplate._id;
      this.eventTemplateFormData.title = eventTemplate.title;
      this.eventTemplateFormData.description = eventTemplate.description;
      this.eventTemplateFormData.location = eventTemplate.location;

      this.eventTemplateEditOverlayVisible = true;
    },
    updateEventTemplate() {
      this.eventTemplateSpinning = true;
      fetch('/api/v1/event-templates/' + this.eventTemplateFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.eventTemplateFormData.title,
          location: this.eventTemplateFormData.location,
          description: this.eventTemplateFormData.description
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedEventTemplate = this.eventTemplates.findIndex((eventTemplate) => eventTemplate._id === data.data.eventTemplate._id);
            this.eventTemplates[indexOfUpdatedEventTemplate] = data.data.eventTemplate;
            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
            this.eventTemplateSpinning = false;
          }
        });
      });
    },
    deleteEventTemplate() {
      this.eventTemplateSpinning = true;
      fetch('/api/v1/event-templates/' + this.eventTemplateFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          let indexOfDeletedEventTemplate = this.eventTemplates.findIndex((eventTemplate) => eventTemplate._id === this.eventTemplateFormData._id);
          this.eventTemplates.splice(indexOfDeletedEventTemplate, 1);

          this.resetEventTemplateForm();
        } else {
          response.json().then((data) => {
            this.eventTemplateFormErrorMessage = data.message;
          });
          this.eventTemplateSpinning = false;
        }
      });
    }
  }
};
</script>
