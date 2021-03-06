<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="filter-container clearfix">
        <el-input v-model="listQuery.fuzzySearch" clearable :placeholder="$t('userInfo.username')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('table.search') }}
        </el-button>
        <el-button v-permission="['sys:user:create']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          {{ $t('table.add') }}
        </el-button>
        <el-button v-permission="['sys:user:delete']" :disabled="batchDeleteButtonStatus" class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="handleDelete()">
          {{ $t('table.batchDelete') }}
        </el-button>
        <el-button class="filter-item" style="float: right;margin-left: 2%;" @click="$router.push({name:'RoleManage'})">
          {{ $t('table.goBack') }}<i class="el-icon-arrow-right" />
        </el-button>
      </div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item :label="$t('userInfo.headImgUrl')">
                <img v-if="props.row.headImgUrl" style="margin-top: -10px;border-radius: 100px;width: 50px; height: 50px;" :src="props.row.headImgUrl" class="avatar">
              </el-form-item>
              <el-form-item :label="$t('userInfo.loginCount')">
                <span>{{ props.row.loginCount }}</span>
              </el-form-item>
              <el-form-item :label="$t('userInfo.createTime')">
                <span>{{ props.row.createTime }}</span>
              </el-form-item>
              <el-form-item :label="$t('userInfo.lastLoginTime')">
                <span>{{ props.row.lastLoginTime }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column :label="$t('userInfo.username')">
          <template slot-scope="scope">
            <span>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('userInfo.roleNames')">
          <template slot-scope="scope">
            <span>{{ scope.row.roleNames }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('userInfo.deptName')">
          <template slot-scope="scope">
            <span>{{ scope.row.deptName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('userInfo.phone')" width="120px">
          <template slot-scope="scope">
            <span>{{ scope.row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPermission(['sys:user:update'])" :label="$t('userInfo.status')" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="changeSwitch($event, scope.row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('userInfo.status')" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | dictFirst(dictionary.style_dict)">
              <span>{{ scope.row.status | dictFirst(dictionary.status_dict) }}</span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPermission(['sys:user:update', 'sys:user:delete', 'sys:user:change:password'])" fixed="right" :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-permission="['sys:user:update']" class="filter-item" style="margin-left: 10px;" type="primary" @click="handleUpdate(row)">
              {{ $t('table.edit') }}
            </el-button>
            <el-button v-permission="['sys:user:delete']" class="filter-item" style="margin-left: 10px;" type="danger" @click="handleDelete(row)">
              {{ $t('table.delete') }}
            </el-button>
            <el-button v-permission="['sys:user:change:password']" class="filter-item" style="margin-left: 10px;" type="warning" @click="handleChangePassword(row)">
              {{ $t('table.changePassword') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />
    </el-card>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible_2">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('userInfo.username')" prop="username">
          <el-input v-model="temp.username" disabled />
        </el-form-item>
        <el-form-item :label="$t('userInfo.password')" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible_2 = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="changePassword()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 500px; margin-left:50px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('userInfo.username')" prop="username">
              <el-input v-model="temp.username" :disabled="dialogStatus==='update'" />
            </el-form-item>
            <el-tooltip class="item" effect="dark" :content="$t('contentMessage.roleMsg')" placement="top">
              <el-form-item :label="$t('contentMessage.roleLabel')" prop="roleIds">
                <el-select v-model="selectedRoles" multiple :placeholder="$t('contentMessage.select')">
                  <el-option
                    v-for="item in roleList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-tooltip>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userInfo.phone')" prop="phone">
              <el-input v-model="temp.phone" />
            </el-form-item>
            <el-form-item :label="$t('departmentInfo.upMenus')">
              <el-cascader
                v-model="deptIds"
                clearable
                expand-trigger="hover"
                change-on-select
                :show-all-levels="false"
                :options="deptList"
                :props="{ value: 'id', label: 'deptName' }"
                @change="deptHandleChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('userInfo.status')">
          <el-radio-group v-model="temp.status">
            <el-radio-button v-for="item in dictionary.status_dict" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('userInfo.headImgUrl')" prop="headImgUrl">
          <el-upload
            class="avatar-uploader"
            :action="uploadActionUrl"
            :show-file-list="false"
            :with-credentials="true"
            :on-success="handlePictureCardPreview"
          >
            <img v-if="temp.headImgUrl" style="margin-top: 6px;border-radius: 100px;width: 60px; height: 60px" :src="temp.headImgUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import permission from '@/directive/permission/index.js'
import checkPermission from '@/utils/permission'
import { fetchList, create, update, remove, loadRoles, changePassword, changeStatus, treeList } from '@/api/SysUser'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'

export default {
  name: 'UserManage',
  components: { Pagination },
  directives: { waves, permission },
  filters: {
    dictFirst(status, dict) {
      const statusMap = {}
      dict.forEach(item => {
        statusMap[item.value] = item.label
      })
      return statusMap[status]
    }
  },
  data() {
    return {
      selectedIds: [2],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      isStatus: false,
      listQuery: {
        current: 1,
        size: 10,
        roleId: null,
        fuzzySearch: undefined
      },
      ids: [],
      temp: {
        id: null,
        username: null,
        password: null,
        status: null,
        headImgUrl: null,
        createTime: null,
        roleIds: null
      },
      dialogFormVisible: false,
      dialogFormVisible_2: false,
      dialogStatus: 'create',
      textMap: {
        update: '编辑用户',
        create: '添加用户',
        change_password: '修改用户密码'
      },
      rules: {
        username: [{ required: true, message: 'username is required', trigger: 'blur' }]
      },
      roleList: [],
      selectedRoles: [],
      deptList: [],
      deptIds: [],
      uploadActionUrl: process.env.VUE_APP_BASE_API + '/file/upload'
    }
  },
  computed: {
    ...mapGetters(['dictionary']),
    batchDeleteButtonStatus() {
      return this.ids.length <= 0
    },
    noActions() {
      return checkPermission(['sys:user:update', 'sys:user:delete', 'sys:user:change:password'])
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      this.listQuery.roleId = this.$route.params.roleId
      fetchList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
        // this.$router.push({ name: 'UserManage' })
      })
    },
    getDeptList() {
      treeList().then(response => {
        this.deptList = response.data
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: null,
        username: null,
        status: 0,
        headImgUrl: null
      }
    },
    handleCreate() {
      this.selectedRoles = []
      this.deptIds = []
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.loadRoles()
      this.getDeptList()
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.roleIds = this.selectedRoles.join()
          create(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.selectedRoles = []
      if (row.roleIds && row.roleIds.split(',') && row.roleIds.split(',').length) {
        row.roleIds.split(',').forEach(item => {
          this.selectedRoles.push(Number.parseInt(item))
        })
      }
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.loadRoles()
      this.getDeptList()
      if (row.deptPids && row.deptPids.split(',') && row.deptPids.split(',').length) {
        this.deptIds = row.deptPids.split(',').map((id, index) => {
          return parseInt(id)
        })
      }
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.roleIds = this.selectedRoles.join()
          tempData.deptPids = this.deptIds.join()
          tempData.deptId = this.deptIds[this.deptIds.length - 1]
          update(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleChangePassword(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'change_password'
      this.dialogFormVisible_2 = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    changePassword() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          changePassword(tempData).then(() => {
            this.dialogFormVisible_2 = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '提示',
        message: h('p', null, [
          h('span', null, '【删除用户】操作，是否继续? ')
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            const _ids = row !== undefined ? [row.id] : this.ids.map(obj => {
              return obj.id
            })
            remove(_ids).then(() => {
              done()
              instance.confirmButtonLoading = false
            })
          } else {
            done()
          }
        }
      }).then(action => {
        this.getList()
        this.$message({
          type: 'success',
          message: '操作完成'
        })
      })
    },
    handleSelectionChange(val) {
      this.ids = val
    },
    deptHandleChange(val) {
      this.deptIds = val
    },
    loadRoles() {
      loadRoles().then(response => {
        this.roleList = response.data
      })
    },
    handlePictureCardPreview(response, file, fileList) {
      this.temp.headImgUrl = response.data.url
    },
    changeSwitch($event, id) {
      const o = { id: id, status: $event }
      this.$confirm('【修改用户状态】操作，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeStatus(o).then(() => {
          this.forLoop(id, o.status)
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
        })
      }).catch(() => {
        this.forLoop(id, o.status === 1 ? 0 : 1)
        this.$message({
          type: 'info',
          message: '已取消修改'
        })
      })
    },
    forLoop(id, status) {
      for (const v of this.list) {
        if (v.id === id) {
          v.status = status
          break
        }
      }
    }
  }
}
</script>

<style>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
