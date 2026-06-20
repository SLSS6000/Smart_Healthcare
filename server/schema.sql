-- 创建数据库
CREATE DATABASE IF NOT EXISTS `smart_healthcare` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `smart_healthcare`;

-- 清理旧表以防表结构冲突
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `appointment`;
DROP TABLE IF EXISTS `health_record`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `doctor`;
DROP TABLE IF EXISTS `drug`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `department`;
SET FOREIGN_KEY_CHECKS = 1;


-- 1. 用户表 (user)
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户自增ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 医生表 (doctor)
CREATE TABLE IF NOT EXISTS `doctor` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '医生自增ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `title` VARCHAR(50) NOT NULL COMMENT '职称（如：主任医师）',
  `department` VARCHAR(50) NOT NULL COMMENT '科室名称',
  `hospital` VARCHAR(100) NOT NULL COMMENT '所属医院',
  `rating` DECIMAL(3, 1) DEFAULT 5.0 COMMENT '评分（例如：4.9）',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT '擅长标签（逗号分隔）',
  `experience` VARCHAR(20) DEFAULT NULL COMMENT '从业年限',
  `consult_count` INT DEFAULT 0 COMMENT '咨询次数',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '医生头像',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='医生表';

-- 3. 预约表 (appointment)
CREATE TABLE IF NOT EXISTS `appointment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '预约自增ID',
  `user_id` INT NOT NULL COMMENT '患者用户ID',
  `doctor_id` INT NOT NULL COMMENT '预约医生ID',
  `date` DATE NOT NULL COMMENT '预约日期',
  `time` VARCHAR(20) NOT NULL COMMENT '预约时间段（例如：08:30）',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending(待就诊), completed(已完成), cancelled(已取消)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '预约创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctor`(`id`) ON DELETE CASCADE,
  -- 唯一性约束：防止同一个医生在同一天同一时间段被重复预约（高并发场景数据库层防线）
  UNIQUE KEY `idx_doctor_date_time` (`doctor_id`, `date`, `time`),
  -- 索引：提高按用户查询预约记录的效率
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- 4. 健康记录表 (health_record)
CREATE TABLE IF NOT EXISTS `health_record` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '健康记录自增ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` VARCHAR(50) NOT NULL COMMENT '指标类型（如：血压、血糖、体重、体温）',
  `value` VARCHAR(50) NOT NULL COMMENT '记录值（例如：120/80）',
  `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位（例如：mmHg）',
  `record_time` DATETIME NOT NULL COMMENT '记录发生的时间',
  `normal` TINYINT(1) DEFAULT 1 COMMENT '是否正常（1为正常，0为异常）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_type_time` (`user_id`, `type`, `record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康记录表';

-- 5. 药品表 (drug)
CREATE TABLE IF NOT EXISTS `drug` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '药品自增ID',
  `name` VARCHAR(100) NOT NULL COMMENT '药品名称',
  `description` TEXT DEFAULT NULL COMMENT '药品描述（如：用于感冒引起的头痛、发热）',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '价格',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='药品表';

-- 6. 资讯表 (news)
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '文章自增ID',
  `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
  `desc` TEXT NOT NULL COMMENT '文章描述/正文',
  `category` VARCHAR(50) NOT NULL COMMENT '分类（如：养生、科普、推荐）',
  `time` DATETIME NOT NULL COMMENT '文章发布时间',
  `views` INT DEFAULT 0 COMMENT '阅读数',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='健康资讯表';

-- 7. 科室表 (department)
CREATE TABLE IF NOT EXISTS `department` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '科室ID',
  `name` VARCHAR(50) NOT NULL COMMENT '科室名称',
  `icon` VARCHAR(10) DEFAULT NULL COMMENT '展示图标',
  `count` INT DEFAULT 0 COMMENT '医生总人数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科室表';


-- ==================== 初始化数据 ====================

-- 插入默认管理员/测试用户
INSERT INTO `user` (`id`, `username`, `password`, `nickname`, `avatar`, `created_at`) VALUES
(1, 'admin', '123456', '管理员', '/images/doctor1.png', '2026-05-06 12:48:40')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`);

-- 插入医生数据
INSERT INTO `doctor` (`id`, `name`, `title`, `department`, `hospital`, `rating`, `tags`, `experience`, `consult_count`, `avatar`) VALUES
(1, '张建国', '主任医师', '心内科', '市第一人民医院', 4.9, '高血压,冠心病,心律失常', '25年', 12580, '/images/doctor1.png'),
(2, '李秀华', '副主任医师', '内分泌科', '市第一人民医院', 4.8, '糖尿病,甲状腺疾病,骨质疏松', '18年', 8920, '/images/doctor2.png'),
(3, '王志强', '主治医师', '消化内科', '市第二人民医院', 4.7, '胃炎,胃溃疡,肠道疾病', '12年', 6350, '/images/doctor3.png'),
(4, '陈美玲', '主任医师', '妇产科', '市妇幼保健院', 4.9, '孕期保健,妇科炎症,产后康复', '20年', 15680, '/images/doctor4.png'),
(5, '刘建华', '副主任医师', '儿科', '市儿童医院', 4.8, '小儿感冒,发育评估,儿童营养', '15年', 9870, '/images/doctor5.png'),
(6, '赵明远', '主任医师', '神经内科', '市第一人民医院', 4.7, '头痛,失眠,脑血管疾病', '22年', 7420, '/images/doctor6.png'),
(7, '孙晓芳', '主治医师', '皮肤科', '市第三人民医院', 4.6, '湿疹,痤疮,皮肤过敏', '10年', 5180, '/images/doctor7.png'),
(8, '周伟强', '副主任医师', '骨科', '市骨科医院', 4.8, '颈椎病,腰椎间盘突出,关节疾病', '16年', 8230, '/images/doctor8.png')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 插入科室数据
INSERT INTO `department` (`id`, `name`, `icon`, `count`) VALUES
(1, '心内科', '❤️', 15),
(2, '内分泌科', '🧪', 12),
(3, '消化内科', '🌿', 10),
(4, '妇产科', '👶', 20),
(5, '儿科', '👧', 25),
(6, '神经内科', '🧠', 8),
(7, '皮肤科', '💆', 14),
(8, '骨科', '🦴', 18)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 插入健康记录
INSERT INTO `health_record` (`id`, `user_id`, `type`, `value`, `unit`, `record_time`, `normal`) VALUES
(1, 1, '血压', '120/80', 'mmHg', '2024-05-05 08:00:00', 1),
(2, 1, '血糖', '5.6', 'mmol/L', '2024-05-05 07:30:00', 1),
(3, 1, '体重', '68.5', 'kg', '2024-05-05 07:20:00', 1),
(4, 1, '血压', '125/82', 'mmHg', '2024-05-04 08:10:00', 1),
(5, 1, '血糖', '5.8', 'mmol/L', '2024-05-04 07:40:00', 1),
(6, 1, '血压', '118/78', 'mmHg', '2024-05-03 07:55:00', 1),
(7, 1, '体重', '68.8', 'kg', '2024-05-03 07:30:00', 1),
(8, 1, '血压', '122/81', 'mmHg', '2024-05-02 08:00:00', 1),
(9, 1, '血糖', '5.7', 'mmol/L', '2024-05-02 07:35:00', 1),
(10, 1, '血压', '124/83', 'mmHg', '2024-05-01 08:15:00', 1),
(11, 1, '体重', '68.3', 'kg', '2026-05-06 12:53:47', 1),
(12, 1, '体温', '36.8', '°C', '2026-05-06 19:30:47', 1),
(13, 1, '体重', '40.0', 'kg', '2026-05-07 09:05:31', 1)
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);

-- 插入资讯数据
INSERT INTO `news` (`id`, `title`, `desc`, `category`, `time`, `views`, `likes`, `image`) VALUES
(1, '春季养生：如何预防过敏性鼻炎', '春季是过敏高发季节，花粉、粉尘等过敏原增多，容易引起过敏性鼻炎。建议外出时佩戴口罩，保持室内空气清新，适当使用加湿器。', '养生', '2024-03-15 10:30:00', 3203, 528, '/images/news1.jpg'),
(2, '高血压患者的饮食指南', '合理的饮食控制对血压管理至关重要。高血压患者应减少钠盐摄入，每日盐量不超过6克；增加钾的摄入，多吃新鲜蔬菜水果；限制脂肪摄入，戒烟限酒。', '科普', '2024-03-14 15:20:00', 5101, 892, '/images/news2.jpg'),
(3, '每天走多少步最健康', '走路是最简单有效的运动方式。研究表明，每天步行6000-8000步可以有效降低心血管疾病风险。建议根据个人体质循序渐进，避免过度运动。', '推荐', '2024-03-13 09:15:00', 8600, 1200, '/images/news3.jpg'),
(4, '睡眠不足的危害与改善方法', '长期睡眠不足会导致免疫力下降、记忆力减退、情绪波动等问题。建议保持规律的作息时间，每晚保证7-8小时 of 睡眠时间。', '养生', '2024-03-12 20:00:00', 4500, 650, '/images/news4.jpg'),
(5, '糖尿病患者如何科学饮食', '糖尿病患者的饮食管理是控制血糖的关键。应选择低GI食物，定时定量进餐，适量摄入膳食纤维，避免血糖剧烈波动。', '科普', '2024-03-11 14:30:00', 6200, 780, '/images/news5.jpg'),
(6, '儿童疫苗接种全攻略', '疫苗接种是预防传染病最有效的方式。根据国家免疫规划，儿童在不同的年龄段需要接种相应的疫苗，家长应按时带孩子进行接种。', '科普', '2024-03-10 11:00:00', 3900, 420, '/images/news6.jpg')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 插入药品数据
INSERT INTO `drug` (`id`, `name`, `description`, `price`) VALUES
(1, '感冒灵颗粒', '用于感冒引起的头痛、发热', 28.00),
(2, '布洛芬缓释胶囊', '用于缓解轻至中度疼痛', 35.00),
(3, '维生素C片', '用于预防和治疗坏血病', 15.00)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 插入初始预约记录
INSERT INTO `appointment` (`id`, `user_id`, `doctor_id`, `date`, `time`, `status`, `created_at`) VALUES
(1, 1, 1, '2026-06-20', '08:30', 'pending', '2026-06-18 15:32:18')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);
