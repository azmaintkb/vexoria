import {districtFor,thanaFor} from './locations.js';
export const deliveryOptions = [
  {id:'nsu', label:'North South University (NSU)', fee:0,district:'dhaka',thana:'vatara',address:'North South University (NSU), Plot 15, Block B, Bashundhara R/A, Dhaka 1229, Bangladesh'},
  {id:'aiub', label:'American International University-Bangladesh (AIUB)', fee:0,district:'dhaka',thana:'khilkhet',address:'American International University-Bangladesh (AIUB), 408/1 (Old KA 66/1), Kuratoli, Khilkhet, Dhaka 1229, Bangladesh'},
  {id:'iub', label:'Independent University, Bangladesh (IUB)', fee:0,district:'dhaka',thana:'vatara',address:'Independent University, Bangladesh (IUB), Plot 16, Block B, Aftabuddin Ahmed Road, Bashundhara R/A, Dhaka, Bangladesh'},
  {id:'inside-dhaka', label:'Inside Dhaka', fee:70},
  {id:'outside-dhaka', label:'Outside Dhaka', fee:130},
];
export function deliveryFor(zone) {
  const option=deliveryOptions.find(option=>option.id===zone);
  if(!option)throw new Error('Choose a valid delivery location.');
  return option;
}

export function deliveryForAddress({district,thana,campus=''}) {
 const d=districtFor(district),t=thanaFor(district,thana);
 if(!d||!t)throw new Error('Choose a valid district and thana / upazila.');
 if(campus){
  const option=deliveryOptions.find(o=>o.id===campus&&o.address);
  if(!option||district!==option.district||thana!==option.thana)throw new Error('Choose the correct university delivery location.');
  return {...option,districtName:d.name,thanaName:t.name};
 }
 return {...deliveryFor(t.city?'inside-dhaka':'outside-dhaka'),districtName:d.name,thanaName:t.name};
}
