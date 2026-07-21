package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.response.UserResponse;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.mapper.UserMapper;
import com.civicpulse.nexus.repository.UserRepository;
import com.civicpulse.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.civicpulse.nexus.dto.request.UpdateProfileRequest;
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateCurrentUserProfile(
            String email,
            UpdateProfileRequest request) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + email));

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone().trim());

        return userMapper.toResponse(userRepository.save(user));
    }
}
