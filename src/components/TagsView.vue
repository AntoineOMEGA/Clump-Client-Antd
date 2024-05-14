<template>
  <a-float-button type="primary" @click="tagEditOverlayVisible = !tagEditOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px;margin-bottom: 15px;">
    <a-input size="large" addonBefore="Search" v-model:value="tagFilterSettings.search"></a-input>
  </div>

  <template v-for="tag in tags" :key="tag._id">
    <a-badge-ribbon :text="tag.color" :color="tag.color" style="right: 5px">
      <a-card :title="tag.title" style="margin: 10px">
        <template #extra>
          <edit-outlined style="font-size: 1.5rem; margin-top: 20px" key="edit" @click="configureTagForm(tag)" />
        </template>
      </a-card>
    </a-badge-ribbon>
  </template>

  <a-drawer v-model:open="tagEditOverlayVisible" @close="resetTagForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="tagFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Color
        <a-input size="large" type="color" v-model:value="tagFormData.color"></a-input>
      </div>

      <div class="mb-2">
        Type
        <a-select size="large" v-model:value="tagFormData.type" style="width: 100%">
          <a-select-option value="normal" key="normal">Schedule</a-select-option>
          <a-select-option value="primary" key="primary">Event Template</a-select-option>
          <a-select-option value="normal" key="normal">Organizational</a-select-option>
        </a-select>
      </div>

      <a-alert message="Error" :description="tagFormErrorMessage" type="error" class="mb-2"
        v-if="tagFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!tagFormData._id" @click="createTag()">Create</a-button>
        <a-button type="primary" size="large" block v-if="tagFormData._id" @click="updateTag()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="tagFormData._id" @click="deleteTag()">Delete</a-button>
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
    this.getTags();
  },
  data() {
    return {
      tagEditOverlayVisible: false,
      tagFormData: {
        title: '',
        color: '#ff0000',
        type: ''
      },
      tagFormErrorMessage: '',
      tags: [],
      tagFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {
    resetTagForm() {
      this.tagEditOverlayVisible = false;
      this.tagFormData = {
        title: '',
        color: '#ffffff',
        type: ''
      };
      this.tagFormErrorMessage = '';
    },
    getTags() {
      fetch('/api/v1/tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.tags = data.data.tags;
          }
        });
      });
    },
    createTag() {
      fetch('/api/v1/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.tagFormData.title,
          color: this.tagFormData.color,
          type: this.tagFormData.type
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.tags.push(data.data.tag);
            this.resetTagForm();
          } else {
            this.tagFormErrorMessage = data.message;
          }
        });
      });
    },
    configureTagForm(tag) {
      this.tagFormData.title = tag.title;
      this.tagFormData.color = tag.color;
      this.tagFormData.type = tag.type;
      this.tagFormData._id = tag._id;

      this.tagEditOverlayVisible = true;
    },
    updateTag() {
      fetch('/api/v1/tags/' + this.tagFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.tagFormData.title,
          color: this.tagFormData.color,
          type: this.tagFormData.type
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedTag = this.tags.findIndex((tag) => tag._id === data.data.tag._id);
            this.tags[indexOfUpdatedTag] = data.data.tag;

            this.resetTagForm();
          } else {
            this.tagFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteTag() {
      fetch('/api/v1/tags/' + this.tagFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            this.getSchedules();
            this.getTags();
            this.resetTagForm();
          } else {
            this.tagFormErrorMessage = data.message;
          }
        });
      });
    }
  }
};
</script>
