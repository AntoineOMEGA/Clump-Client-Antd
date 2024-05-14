<template>
  <a-float-button type="primary" @click="eventTemplateTagEditOverlayVisible = !eventTemplateTagEditOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="eventTemplateTagFilterSettings.search"></a-input>
  </div>

  <template v-for="eventTemplateTag in eventTemplateTags" :key="eventTemplateTag._id">
    <a-badge-ribbon :text="eventTemplateTag.color" :color="eventTemplateTag.color" style="top: -5px; right: 5px">
      <a-card :title="eventTemplateTag.title" style="margin: 10px">
        <template #extra>
          <edit-outlined style="font-size: 1.5rem; margin-top: 20px" key="edit"
            @click="configureEventTemplateTagForm(eventTemplateTag)" />
        </template>
      </a-card>
    </a-badge-ribbon>
  </template>

  <a-drawer v-model:open="eventTemplateTagEditOverlayVisible" @close="resetEventTemplateTagForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="eventTemplateTagFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Color
        <a-input size="large" type="color" v-model:value="eventTemplateTagFormData.color"></a-input>
      </div>

      <div class="mb-2">
        Type
        <a-select size="large" v-model:value="eventTemplateTagFormData.type" style="width: 100%">
          <a-select-option value="normal" key="normal">Normal</a-select-option>
          <a-select-option value="primary" key="primary">Primary</a-select-option>
        </a-select>
      </div>

      <a-alert message="Error" :description="eventTemplateTagFormErrorMessage" type="error" class="mb-2"
        v-if="eventTemplateTagFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!eventTemplateTagFormData._id"
          @click="createEventTemplateTag()">Create</a-button>
        <a-button type="primary" size="large" block v-if="eventTemplateTagFormData._id"
          @click="updateEventTemplateTag()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="eventTemplateTagFormData._id"
          @click="deleteEventTemplateTag()">Delete</a-button>
      </a-flex>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  mounted() {
    this.getEventTemplateTags();
  },
  data() {
    return {
      eventTemplateTagEditOverlayVisible: false,
      eventTemplateTagFormData: {
        title: '',
        color: '#ff0000',
        type: ''
      },
      eventTemplateTagFormErrorMessage: '',
      eventTemplateTags: [],
      eventTemplateTagFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {
    resetEventTemplateTagForm() {
      this.eventTemplateTagEditOverlayVisible = false;
      this.eventTemplateTagFormData = {
        title: '',
        color: '#ffffff',
        type: ''
      };
      this.eventTemplateTagFormErrorMessage = '';
    },
    getEventTemplateTags() {
      fetch('/api/v1/event-template-tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.eventTemplateTags = data.data.eventTemplateTags;
          }
        });
      });
    },
    createEventTemplateTag() {
      fetch('/api/v1/event-template-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.eventTemplateTagFormData.title,
          color: this.eventTemplateTagFormData.color,
          type: this.eventTemplateTagFormData.type
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.eventTemplateTags.push(data.data.eventTemplateTag);
            this.reseteventTemplateTagForm();
          } else {
            this.eventTemplateTagFormErrorMessage = data.message;
          }
        });
      });
    },
    configureeventTemplateTagForm(eventTemplateTag) {
      this.eventTemplateTagFormData.title = eventTemplateTag.title;
      this.eventTemplateTagFormData.color = eventTemplateTag.color;
      this.eventTemplateTagFormData.type = eventTemplateTag.type;
      this.eventTemplateTagFormData._id = eventTemplateTag._id;

      this.eventTemplateTagEditOverlayVisible = true;
    },
    updateeventTemplateTag() {
      fetch('/api/v1/event-template-tags/' + this.eventTemplateTagFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.eventTemplateTagFormData.title,
          color: this.eventTemplateTagFormData.color,
          type: this.eventTemplateTagFormData.type
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedeventTemplateTag = this.eventTemplateTags.findIndex((eventTemplateTag) => eventTemplateTag._id === data.data.eventTemplateTag._id);
            this.eventTemplateTags[indexOfUpdatedeventTemplateTag] = data.data.eventTemplateTag;

            this.reseteventTemplateTagForm();
          } else {
            this.eventTemplateTagFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteeventTemplateTag() {
      fetch('/api/v1/event-template-tags/' + this.eventTemplateTagFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            this.geteventTemplates();
            this.geteventTemplateTags();
            this.reseteventTemplateTagForm();
          } else {
            this.eventTemplateTagFormErrorMessage = data.message;
          }
        });
      });
    }
  }
};
</script>
