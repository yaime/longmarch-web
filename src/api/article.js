import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/cms/article/search',
    method: 'post',
    data
  })
}

export function create(data) {
  return request({
    url: '/cms/article/create',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/cms/article/update',
    method: 'post',
    data
  })
}

export function remove(data) {
  return request({
    url: '/cms/article/delete',
    method: 'post',
    data
  })
}
