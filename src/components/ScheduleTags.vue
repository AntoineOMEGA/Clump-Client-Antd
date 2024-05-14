<template>
  <a-float-button type="primary" @click="scheduleTagEditOverlayVisible = !scheduleTagEditOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleTagFilterSettings.search"></a-input>
  </div>

  <template v-for="scheduleTag in scheduleTags" :key="scheduleTag._id">
    <a-badge-ribbon :text="scheduleTag.color" :color="scheduleTag.color" style="top: -5px; right: 5px">
      <a-card :title="scheduleTag.title" style="margin: 10px">
        <template #extra>
          <edit-outlined style="font-size: 1.5rem; margin-top: 20px" key="edit"
            @click="configureScheduleTagForm(scheduleTag)" />
        </template>
      </a-card>
    </a-badge-ribbon>
  </template>

  <a-drawer v-model:open="scheduleTagEditOverlayVisible" @close="resetScheduleTagForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="scheduleTagFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Color
        <a-input size="large" type="color" v-model:value="scheduleTagFormData.color"></a-input>
      </div>

      <div class="mb-2">
        Type
        <a-select size="large" v-model:value="scheduleTagFormData.type" style="width: 100%">
          <a-select-option value="normal" key="normal">Normal</a-select-option>
          <a-select-option value="primary" key="primary">Primary</a-select-option>
        </a-select>
      </div>

      <a-alert message="Error" :description="scheduleTagFormErrorMessage" type="error" class="mb-2"
        v-if="scheduleTagFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!scheduleTagFormData._id"
          @click="createScheduleTag()">Create</a-button>
        <a-button type="primary" size="large" block v-if="scheduleTagFormData._id"
          @click="updateScheduleTag()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="scheduleTagFormData._id"
          @click="deleteScheduleTag()">Delete</a-button>
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
    this.getScheduleTags();
  },
  data() {
    return {
      scheduleTagEditOverlayVisible: false,
      scheduleTagFormData: {
        title: '',
        color: '#ff0000',
        type: ''
      },
      scheduleTagFormErrorMessage: '',
      scheduleTags: [],
      scheduleTagFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {
    resetScheduleTagForm() {
      this.scheduleTagEditOverlayVisible = false;
      this.scheduleTagFormData = {
        title: '',
        color: '#ffffff',
        type: ''
      };
      this.scheduleTagFormErrorMessage = '';
    },
    getScheduleTags() {
      fetch('/api/v1/schedule-tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.scheduleTags = data.data.scheduleTags;
          }
        });
      });
    },
    createScheduleTag() {
      fetch('/api/v1/schedule-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleTagFormData.title,
          color: this.scheduleTagFormData.color,
          type: this.scheduleTagFormData.type
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.scheduleTags.push(data.data.scheduleTag);
            this.resetScheduleTagForm();
          } else {
            this.scheduleTagFormErrorMessage = data.message;
          }
        });
      });
    },
    configureScheduleTagForm(scheduleTag) {
      this.scheduleTagFormData.title = scheduleTag.title;
      this.scheduleTagFormData.color = scheduleTag.color;
      this.scheduleTagFormData.type = scheduleTag.type;
      this.scheduleTagFormData._id = scheduleTag._id;

      this.scheduleTagEditOverlayVisible = true;
    },
    updateScheduleTag() {
      fetch('/api/v1/schedule-tags/' + this.scheduleTagFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleTagFormData.title,
          color: this.scheduleTagFormData.color,
          type: this.scheduleTagFormData.type
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedScheduleTag = this.scheduleTags.findIndex((scheduleTag) => scheduleTag._id === data.data.scheduleTag._id);
            this.scheduleTags[indexOfUpdatedScheduleTag] = data.data.scheduleTag;

            this.resetScheduleTagForm();
          } else {
            this.scheduleTagFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteScheduleTag() {
      fetch('/api/v1/schedule-tags/' + this.scheduleTagFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            this.getSchedules();
            this.getScheduleTags();
            this.resetScheduleTagForm();
          } else {
            this.scheduleTagFormErrorMessage = data.message;
          }
        });
      });
    }
  }
};
</script>
