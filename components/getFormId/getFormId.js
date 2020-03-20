import {Config, Http} from './../../utils/index';

Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    //是否可用
    disabled: {
      type: Boolean,
      value: false
    },
  },
  methods: {
    //from提交
    formSubmit(e) {
      this.triggerEvent('callback');
      let formId = e.detail.formId;
      if (formId === 'the formId is a mock one') return;
      Http.post(
        Config.api.messageFormAdd,
        {form_id: formId, is_no_prompt: true},
        {handleError: false}
      );
    }
  }
})
