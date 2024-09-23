<template>
  <a-float-button type="primary" @click="tagEditOverlayVisible = !tagEditOverlayVisible" style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px; margin-bottom: 15px">
    <a-input size="large" addonBefore="Search" v-model:value="tagFilterSettings.search"></a-input>
  </div>

  <a-spin :spinning="tagLoadSpinning">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="tag in tags" :key="tag._id">
        <a-card :title="tag.title" style="margin: 10px">
          <template #extra>
            <edit-outlined style="font-size: 1.5rem" key="edit" @click="configureTagForm(tag)" />
          </template>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>

  <a-drawer v-model:open="tagEditOverlayVisible" @close="resetTagForm()">
    <a-spin :spinning="tagSpinning">
      <a-form>
        <div class="mb-2">
          Title
          <a-input size="large" v-model:value="tagFormData.title"></a-input>
        </div>

        <div class="mb-2">
          Color
          <a-input size="large" type="color" v-model:value="tagFormData.color"></a-input>
        </div>

        <a-alert message="Error" :description="tagFormErrorMessage" type="error" class="mb-2" v-if="tagFormErrorMessage != ''" />

        <a-flex justify="space-around" align="middle" gap="middle">
          <a-button type="primary" size="large" block v-if="!tagFormData._id" @click="createTag()">Create</a-button>
          <a-button type="primary" size="large" block v-if="tagFormData._id" @click="updateTag()">Save</a-button>
          <a-button type="primary" size="large" block danger v-if="tagFormData._id" @click="deleteTag()">Delete</a-button>
        </a-flex>
      </a-form>
    </a-spin>
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
      tagLoadSpinning: false,
      tagSpinning: false,
      tagFormData: {
        title: '',
        color: '#ff0000'
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
      this.tagSpinning = false;
      this.tagEditOverlayVisible = false;
      this.tagFormData = {
        title: '',
        color: '#ffffff'
      };
      this.tagFormErrorMessage = '';
    },
    getTags() {
      this.tagLoadSpinning = true;
      fetch('/api/v1/tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.tags = data.data.tags;
          }
          this.tagLoadSpinning = false;
        });
      });
    },
    createTag() {
      this.tagSpinning = true;
      fetch('/api/v1/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.tagFormData.title,
          color: this.tagFormData.color
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.tags.push(data.data.tag);
            this.resetTagForm();
          } else {
            this.tagFormErrorMessage = data.message;
            this.tagSpinning = false;
          }
        });
      });
    },
    configureTagForm(tag) {
      this.tagFormData.title = tag.title;
      this.tagFormData.color = tag.color;
      this.tagFormData._id = tag._id;

      this.tagEditOverlayVisible = true;
    },
    updateTag() {
      this.tagSpinning = true;
      fetch('/api/v1/tags/' + this.tagFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.tagFormData.title,
          color: this.tagFormData.color
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedTag = this.tags.findIndex((tag) => tag._id === data.data.tag._id);
            this.tags[indexOfUpdatedTag] = data.data.tag;

            this.resetTagForm();
          } else {
            this.tagFormErrorMessage = data.message;
            this.tagSpinning = false;
          }
        });
      });
    },
    deleteTag() {
      this.tagSpinning = true;
      fetch('/api/v1/tags/' + this.tagFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            this.resetTagForm();
          } else {
            this.tagFormErrorMessage = data.message;
            this.tagSpinning = false;
          }
        });
      });
    }
  }
};
</script>
