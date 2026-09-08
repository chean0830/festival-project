package com.example.festival.live.admission.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.nullable;

import com.example.festival.live.admission.repository.LiveAdmissionPaymentRepository;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.member.entity.Member;
import com.example.festival.member.entity.MemberRole;
import com.example.festival.member.repository.MemberRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class LiveAdmissionAccessServiceTests {

    @Mock
    private LiveAdmissionPaymentRepository paymentRepository;

    @Mock
    private MemberRepository memberRepository;

    private LiveAdmissionAccessService service;

    @BeforeEach
    void setUp() {
        service = new LiveAdmissionAccessService(paymentRepository, memberRepository);
    }

    @Test
    void freeStreamDoesNotRequireAdmission() {
        LiveStream stream = mock(LiveStream.class);
        when(stream.isPaid()).thenReturn(false);

        assertThat(service.isAdmissionRequired(stream, null)).isFalse();
        verifyNoInteractions(paymentRepository, memberRepository);
    }

    @Test
    void paidStreamRequiresLoginForGuest() {
        LiveStream stream = paidStream(10L, false);

        assertThat(service.isAdmissionRequired(stream, null)).isTrue();
        assertThatThrownBy(() -> service.requireAdmission(stream, null))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void ownerAndAdminCanEnterWithoutPayment() {
        LiveStream ownerStream = paidStream(10L, true);
        assertThat(service.isAdmissionRequired(ownerStream, 1L)).isFalse();

        LiveStream adminStream = paidStream(11L, false);
        Member admin = mock(Member.class);
        when(admin.getRole()).thenReturn(MemberRole.ADMIN);
        when(memberRepository.findById(2L)).thenReturn(Optional.of(admin));
        assertThat(service.isAdmissionRequired(adminStream, 2L)).isFalse();
    }

    @Test
    void successfulPaymentUnlocksPaidStream() {
        LiveStream stream = paidStream(10L, false);
        Member viewer = mock(Member.class);
        when(viewer.getRole()).thenReturn(MemberRole.USER);
        when(memberRepository.findById(3L)).thenReturn(Optional.of(viewer));
        when(paymentRepository.existsByStream_IdAndMember_IdAndStatus(10L, 3L, "SUCCESS"))
                .thenReturn(true);

        assertThat(service.isAdmissionRequired(stream, 3L)).isFalse();
    }

    @Test
    void unpaidViewerIsRejectedBeforeLiveKitTokenIssuance() {
        LiveStream stream = paidStream(10L, false);
        Member viewer = mock(Member.class);
        when(viewer.getRole()).thenReturn(MemberRole.USER);
        when(memberRepository.findById(4L)).thenReturn(Optional.of(viewer));
        when(paymentRepository.existsByStream_IdAndMember_IdAndStatus(10L, 4L, "SUCCESS"))
                .thenReturn(false);

        assertThatThrownBy(() -> service.requireAdmission(stream, 4L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.PAYMENT_REQUIRED));
    }

    private LiveStream paidStream(Long streamId, boolean owner) {
        LiveStream stream = mock(LiveStream.class);
        when(stream.isPaid()).thenReturn(true);
        lenient().when(stream.isOwnedBy(nullable(Long.class))).thenReturn(owner);
        lenient().when(stream.getId()).thenReturn(streamId);
        return stream;
    }
}
